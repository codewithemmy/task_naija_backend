const { isAuthenticated } = require("../../utils")
const {
  verifyUserController,
  forgotPasswordController,
  resetPasswordController,
  resendOtpController,
} = require("./controller/auth.controller")

const authRoute = require("express").Router()

//routes
authRoute.post("/verify", verifyUserController)
authRoute.post("/forgot-password", forgotPasswordController)
authRoute.patch("/reset-password", resetPasswordController)
authRoute.post("/resend-otp", resendOtpController)

module.exports = authRoute
