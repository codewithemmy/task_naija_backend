const { default: mongoose, mongo } = require("mongoose")
const {
  PaystackPaymentService,
} = require("../../../providers/paystack/paystack")
const {
  TransactionFailure,
  TransactionSuccess,
} = require("../transaction.messages")
const { UserRepository } = require("../../user/user.repository")

const { TransactionRepository } = require("../transaction.repository")
const { queryConstructor } = require("../../../utils")

class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new PaystackPaymentService()
  }

  static async initiatePaymentTransaction(payload) {
    const { userType, userId, email, amount, orderId, extras = {} } = payload

    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(userId),
    })

    if (!user)
      return { success: false, msg: `invalid user for payment initiation` }

    await this.getConfig()
    const paymentDetails = await this.paymentProvider.initiatePayment({
      email,
      amount,
    })

    if (!paymentDetails.success)
      return { success: false, msg: TransactionFailure.INITIATE }

    const transaction = await TransactionRepository.create({
      userId,
      userType,
      amount,
      orderId: new mongoose.Types.ObjectId(orderId),
      reference: paymentDetails.data.reference,
      channel: "paystack",
      ...extras,
    })

    if (!transaction._id)
      return { success: false, msg: TransactionFailure.INITIATE }

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: {
        ...paymentDetails,
      },
    }
  }

  static async getTransactionService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Transaction"
    )
    if (error) return { success: false, msg: error }

    const transaction = await TransactionRepository.fetchTransactionsByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (transaction.length < 1)
      return { success: false, msg: `you don't have any transaction history` }

    return {
      success: true,
      msg: `transaction fetched successfully`,
      data: transaction,
    }
  }

  static async verifyCardPayment(payload) {
    await this.getConfig()
    return this.paymentProvider.verifyCardPayment(payload)
  }
}

module.exports = { TransactionService }
