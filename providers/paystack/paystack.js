const mongoose = require("mongoose")
const { config } = require("../../core/config")

const {
  TransactionMessages,
} = require("../../files/transaction/transaction.messages")
const {
  TransactionRepository,
} = require("../../files/transaction/transaction.repository")

const RequestHandler = require("../../utils/axios.provision")
const { providerMessages } = require("../providers.messages")
const { OrderRepository } = require("../../files/order/order.repository")

class PaystackPaymentService {
  paymentRequestHandler = RequestHandler.setup({
    baseURL: config.PAYSTACK_URL,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${config.PAYSTACK_KEY}`,
      "Accept-Encoding": "gzip,deflate,compress",
    },
  })

  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async verifySuccessOfPayment(payload) {
    const statusVerification = this.checkSuccessStatus(
      payload.status,
      payload.gateway_response
    )

    let responseStatus = "pending"
    if (statusVerification.success) {
      responseStatus = "confirmed"

      const updatedExisting =
        await TransactionRepository.updateTransactionDetails(
          { reference: payload.reference },
          { status: responseStatus, metaData: JSON.stringify(payload) }
        )

      if (!updatedExisting)
        return {
          success: false,
          msg: TransactionMessages.PAYMENT_FAILURE,
        }
      await OrderRepository.updateOrderDetails(
        {
          _id: new mongoose.Types.ObjectId(updatedExisting.orderId),
          paymentStatus: "pending",
        },
        { paymentStatus: "paid" }
      )
      return {
        success: statusVerification.success,
        msg: statusVerification.msg,
      }
    } else {
      responseStatus = "failed"
      await TransactionRepository.updateTransactionDetails(
        { reference: payload.reference },
        { status: responseStatus, metaData: JSON.stringify(payload) }
      )

      if (!updatedExisting)
        return {
          success: false,
          msg: TransactionMessages.PAYMENT_FAILURE,
        }

      return {
        success: statusVerification.success,
        msg: statusVerification.msg,
      }
    }
  }

  async initiatePayment(paymentPayload) {
    const { email, amount } = paymentPayload

    const paystackResponse = await this.paymentRequestHandler({
      method: "POST",
      url: "/transaction/initialize",
      data: {
        amount: amount,
        email,
      },
    })

    if (!paystackResponse.status)
      return { success: false, msg: providerMessages.INITIATE_PAYMENT_FAILURE }

    const paystackData = paystackResponse.data.data

    const response = {
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
    }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
      data: response,
    }
  }

  async verifyCardPayment(payload) {
    //check success of transaction
    const { data } = payload
    const transaction = await TransactionRepository.fetchOne({
      reference: data.reference,
    })

    if (!transaction?._id)
      return { success: false, msg: TransactionMessages.TRANSACTION_NOT_FOUND }

    if (transaction?.status != "pending")
      return { success: false, msg: TransactionMessages.DUPLICATE_TRANSACTION }

    const verifyAndUpdateTransactionRecord = await this.verifySuccessOfPayment(
      data
    )

    if (!verifyAndUpdateTransactionRecord.success)
      return { success: false, msg: verifyAndUpdateTransactionRecord.msg }

    return { success: true, msg: TransactionMessages.PAYMENT_SUCCESS }
  }
}

module.exports = { PaystackPaymentService }
