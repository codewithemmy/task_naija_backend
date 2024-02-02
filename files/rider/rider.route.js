const { uploadManager } = require("../../utils/multer")
const riderRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

const {
  createRiderController,
  updateRiderController,
  vehicleDetailsController,
  riderLoginController,
  verifyRiderController,
  resentOtpController,
  forgotPasswordController,
  resetPasswordController,
} = require("./rider.controller")

riderRoute.route("/login").post(riderLoginController)
riderRoute.route("/verify").post(verifyRiderController)
riderRoute.route("/resend-otp").post(resentOtpController)
riderRoute.route("/forgot-password").post(forgotPasswordController)
riderRoute.route("/reset-password").post(resetPasswordController)

//routes
riderRoute.route("/").post(createRiderController)

riderRoute.use(isAuthenticated)

riderRoute.route("/").patch(updateRiderController)

riderRoute
  .route("/vehicle")
  .patch(uploadManager("riderImage").single("image"), vehicleDetailsController)

module.exports = riderRoute
