const mongoose = require("mongoose")
const {
  tokenHandler,
  verifyPassword,
  queryConstructor,
  AlphaNumeric,
  hashPassword,
} = require("../../utils")

const { UserSuccess, UserFailure } = require("./user.messages")
const { UserRepository } = require("./user.repository")
const {
  SocketRepository,
} = require("../../files/messages/sockets/sockets.repository")
const { OrderRepository } = require("../order/order.repository")
const { sendMailNotification } = require("../../utils/email")

class UserService {
  static async createUserService(body) {
    const { email, accountType } = body

    const validateUser = await UserRepository.validateUser({
      email,
      accountType,
    })
    if (validateUser)
      return { success: false, msg: `Already a registered user` }

    const userExist = await UserRepository.validateTempUser({
      email,
      accountType,
    })

    let user

    const verification = await AlphaNumeric(6, "number")

    if (userExist) {
      user = await UserRepository.updateTempUserByParams(
        { email, accountType },
        { verificationOtp: verification }
      )
      const substitutional_parameters = {
        otp: verification,
      }

      try {
        await sendMailNotification(
          email,
          "Task Naija Registration",
          substitutional_parameters,
          "VERIFICATION"
        )
      } catch (error) {
        console.log("email error", error)
      }
    } else {
      user = await UserRepository.createTemp({
        email,
        accountType,
        verificationOtp: verification,
      })

      const substitutional_parameters = {
        otp: verification,
      }

      try {
        await sendMailNotification(
          email,
          "Task Naija Registration",
          substitutional_parameters,
          "VERIFICATION"
        )
      } catch (error) {
        console.log("email error", error)
      }
    }

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    return {
      success: true,
      msg: UserSuccess.CREATE,
    }
  }

  static async createTaskerService(body) {
    const { mobile, password, accountType } = body

    const validateUser = await UserRepository.validateUser({
      mobile,
      accountType,
    })

    if (validateUser)
      return { success: false, msg: `Already a registered tasker` }

    const hashedPassword = await hashPassword(password)

    const user = await UserRepository.create({
      mobile,
      accountType,
      password: hashedPassword,
      rating: [{}],
      loginType: "normal-login",
    })

    if (!user._id) return { success: false, msg: UserFailure.TASKER }

    const token = await tokenHandler({ _id: user._id })

    return {
      success: true,
      msg: UserSuccess.TASKER,
      data: token,
    }
  }

  static async resendOtpService(payload) {
    const { email } = payload
    const validate = await UserRepository.findSingleTempUserWithParams({
      email,
    })

    if (!validate) return { success: false, msg: UserFailure.FETCH }

    const otp = AlphaNumeric(6, "number")

    validate.verificationOtp = otp

    await validate.save()
    const substitutional_parameters = {
      otp: otp,
    }
    try {
      await sendMailNotification(
        email,
        "Task Naija Registration",
        substitutional_parameters,
        "VERIFICATION"
      )
    } catch (error) {
      console.log("email error", error)
    }

    return {
      success: true,
      msg: "Otp sent",
    }
  }

  static async verifyUserOtp(body) {
    const { otp, email } = body

    const confirmOtp = await UserRepository.findSingleTempUserWithParams({
      verificationOtp: otp,
      email,
    })

    if (!confirmOtp) return { success: false, msg: UserFailure.OTP }

    confirmOtp.verificationOtp = ""
    await confirmOtp.save()

    return {
      success: true,
      msg: UserSuccess.OTP,
    }
  }

  static async userPasswordService(body) {
    const { email, password } = body

    const tempUser = await UserRepository.findSingleTempUserWithParams({
      email,
    })

    if (!tempUser) return { success: false, msg: UserFailure.USER_FOUND }

    const hashedPassword = await hashPassword(password)
    const user = await UserRepository.create({
      email: tempUser.email,
      accountType: tempUser.accountType,
      password: hashedPassword,
      isVerified: true,
      rating: [{}],
    })

    if (!user) return { success: false, msg: UserFailure.CREATE }

    await UserRepository.deleteTempUserByParams({
      _id: new mongoose.Types.ObjectId(tempUser._id),
    })

    return {
      success: true,
      msg: UserSuccess.SIGN_UP,
    }
  }

  static async userLoginService(payload) {
    const { email, password } = payload

    const userProfile = await UserRepository.findSingleUserWithParams({
      email: email,
    })

    if (!userProfile) return { success: false, msg: UserFailure.USER_FOUND }

    if (!userProfile.isVerified)
      return { success: false, msg: UserFailure.VERIFIED }

    const isPassword = await verifyPassword(password, userProfile.password)

    if (!isPassword) return { success: false, msg: UserFailure.PASSWORD }

    let token

    userProfile.password = undefined

    token = await tokenHandler({
      _id: userProfile._id,
      email: userProfile.email,
      accountType: userProfile.accountType,
    })

    const user = {
      _id: userProfile._id,
      email: userProfile.email,
      accountType: userProfile.accountType,
      ...token,
    }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }

  static async updateProfileService(id, body) {
    // delete body.email

    const user = await UserRepository.findSingleUserWithParams({
      _id: id,
    })

    let locationCoord

    if (body.lng && body.lat) {
      locationCoord = {
        type: "Point",
        coordinates: [parseFloat(body.lng), parseFloat(body.lat)],
      }
    }

    if (!user) return { success: false, msg: UserFailure.FETCH }
    const userprofile = await UserRepository.updateUserByParams(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        ...body,
        locationCoord,
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async imageUploadService(id, body) {
    const { image } = body
    if (!image) return { success: false, msg: `Image cannot be empty` }
    const userprofile = await UserRepository.updateUserByParams(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        profileImage: image,
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async videoUploadService(id, body) {
    const { image } = body

    if (!image) return { success: false, msg: `Image cannot be empty` }
    const userprofile = await UserRepository.updateUserByParams(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        profileVideo: image,
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }

  static async documentUploadService(id, body) {
    const { image } = body

    if (!image) return { success: false, msg: `Image cannot be empty` }
    const userprofile = await UserRepository.updateUserByParams(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        document: image,
      }
    )

    if (!userprofile) return { success: false, msg: UserFailure.UPDATE }

    return {
      success: true,
      msg: UserSuccess.UPDATE,
    }
  }
}
module.exports = { UserService }
