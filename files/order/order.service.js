const mongoose = require("mongoose")
const { OrderRepository } = require("./order.repository")
const {
  queryConstructor,
  AlphaNumeric,
  generateOtp,
} = require("../../utils/index")
const { orderMessage } = require("./order.messages")
const { SocketRepository } = require("../messages/sockets/sockets.repository")

class OrderService {
  static async createOrderService(payload, params) {
    const orderExist = await OrderRepository.findSingleOrderExist({
      userId: new mongoose.Types.ObjectId(params),
    })

    if (orderExist) return { success: false, msg: orderMessage.ORDER_EXIST }

    const { otp } = generateOtp()
    const trackingId = AlphaNumeric(9)

    const order = await OrderRepository.createOrder({
      userId: new mongoose.Types.ObjectId(params),
      orderId: otp,
      trackingId,
      ...payload,
    })

    if (!order) return { success: false, msg: orderMessage.ORDER_ERROR }

    return { success: true, msg: orderMessage.ORDER_CREATED, data: order }
  }

  static async fetchOrder(query) {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "Order"
    )

    if (error) return { success: false, msg: error }

    const order = await OrderRepository.fetchOrderByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!order)
      return {
        success: true,
        msg: orderMessage.ORDER_NOT_FOUND,
        data: [],
      }

    return {
      success: true,
      msg: orderMessage.ORDER_FETCHED,
      data: order,
    }
  }

  static async updateOrderService(payload, params) {
    const findOrder = await OrderRepository.findSingleOrderByParams({
      _id: new mongoose.Types.ObjectId(params),
    })

    if (!findOrder) return { success: false, msg: orderMessage.ORDER_NOT_FOUND }

    const order = await OrderRepository.updateOrderDetails(
      { _id: new mongoose.Types.ObjectId(params), paymentStatus: "paid" },
      { ...payload }
    )

    if (!order) return { success: false, msg: orderMessage.UPDATE_ERROR }
    console.log("right here")
    return {
      success: true,
      msg: orderMessage.UPDATE,
    }
  }

  static async ratingOrderService(payload, params) {
    const findOrder = await OrderRepository.findSingleOrderByParams({
      _id: new mongoose.Types.ObjectId(params),
    })

    if (!findOrder) return { success: false, msg: orderMessage.ORDER_NOT_FOUND }

    const order = await OrderRepository.updateOrderDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      { $push: { ratings: { ...payload } } }
    )

    if (!order) return { success: false, msg: orderMessage.UPDATE_ERROR }

    return {
      success: true,
      msg: orderMessage.UPDATE,
    }
  }

  static async getOrderRoute({ body, io }) {
    const { riderId, orderId, lat, lng } = body

    const [order, location] = await Promise.all([
      await OrderRepository.findSingleOrderByParams({
        _id: new mongoose.Types.ObjectId(orderId),
        riderId,
        paymentStatus: "paid",
      }),
      await OrderRepository.findSingleOrderByParams({
        "receiverDetails.lat": lat,
        "receiverDetails.lng": lng,
        riderId,
        paymentStatus: "paid",
      }),
    ])

    if (!order) return { success: true, msg: `Order not found`, data: [] }
    if (location) return { success: true, msg: `Destination reached` }

    const socketDetails = await SocketRepository.findSingleSocket({
      userId: new mongoose.Types.ObjectId(riderId),
    })

    if (socketDetails)
      io.to(socketDetails.socketId).emit("private-message", order)

    return { success: true, msg: `Order location fetched` }
  }
}

module.exports = { OrderService }
