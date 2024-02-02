const { uploadManager, videoManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { validate } = require("../../validations/validate")

//controller files
const {
  createUserController,
  resentUserOtp,
  verifyUserOtp,
  userLoginController,
  userPasswordController,
  createTaskerController,
  userUpdateController,
  userImageController,
  userVideoController,
  userDocumentController,
} = require("./user.controller")

const { loginValidation } = require("../../validations/users/loginValidation")

//routes
userRoute.route("/").post(createUserController)
userRoute.route("/tasker").post(createTaskerController)
userRoute.route("/").patch(isAuthenticated, userUpdateController)
userRoute.route("/resend-otp").post(resentUserOtp)
userRoute.route("/verify-otp").post(verifyUserOtp)
userRoute.route("/user-password").post(userPasswordController)
userRoute
  .route("/login")
  .post(checkSchema(loginValidation), userLoginController)

userRoute
  .route("/image")
  .post(
    isAuthenticated,
    uploadManager("profileImage").single("image"),
    userImageController
  )

userRoute
  .route("/video")
  .post(
    isAuthenticated,
    videoManager("profileVideo").single("video"),
    userVideoController
  )

userRoute
  .route("/document")
  .post(
    isAuthenticated,
    uploadManager("profileImage").single("image"),
    userDocumentController
  )

// userRoute.use(isAuthenticated)

// userRoute.route("/").patch(userUpdateController)

// //rider route
// userRoute.route("/rider-route").get(getRiderRouteController)

module.exports = userRoute
