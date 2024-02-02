const transactionRoute = require("express").Router()

const { isAuthenticated } = require("../../utils")
const {
  paymentTransactionController,
  paystackWebHook,
} = require("./controller/transaction.controller")

transactionRoute.post("/paystack-webhook", paystackWebHook)

transactionRoute.use(isAuthenticated)

transactionRoute.post("/initiate", paymentTransactionController)

//routes
module.exports = transactionRoute
