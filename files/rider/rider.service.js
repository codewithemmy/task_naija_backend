const mongoose = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  queryConstructor,

  AlphaNumeric,
  generateOtp,
} = require("../../utils")
const { RiderSuccess, RiderFailure } = require("./rider.messages")
const { RiderRepository } = require("./rider.repository")

const { sendMailNotification } = require("../../utils/email")
const { AuthFailure, AuthSuccess } = require("../auth/auth.messages")

class RiderService {
  static async createRiderService(body) {
    const { password, phone } = body

    const riderExist = await RiderRepository.validateRider({
      phone,
    })

    if (riderExist) return { success: false, msg: RiderFailure.EXIST }

    const rider = await RiderRepository.create({
      ...body,
      password: await hashPassword(password),
    })

    if (!rider._id) return { success: false, msg: RiderFailure.CREATE }

    let token = await tokenHandler({
      _id: rider._id,
    })

    return {
      success: true,
      msg: RiderSuccess.CREATE,
      token,
    }
  }

  static async riderLoginService(payload) {
    const { email, password } = payload

    //return result
    const riderProfile = await RiderRepository.findSingleRiderWithParams({
      email: email,
    })

    if (!riderProfile) return { success: false, msg: RiderFailure.EMAIL_EXIST }

    if (!riderProfile.isVerified)
      return { success: false, msg: RiderFailure.VERIFIED }

    const isPassword = await verifyPassword(password, riderProfile.password)

    if (!isPassword) return { success: false, msg: RiderFailure.PASSWORD_ERROR }

    let token

    riderProfile.password = undefined

    token = await tokenHandler({
      _id: riderProfile._id,
      fullName: riderProfile.fullName,
      email: riderProfile.email,
      phone: riderProfile.phone,
    })

    const rider = {
      _id: riderProfile._id,
      fullName: riderProfile.fullName,
      email: riderProfile.email,
      phone: riderProfile.phone,
      ...token,
    }

    //return result
    return {
      success: true,
      msg: RiderSuccess.FETCH,
      data: rider,
    }
  }

  static async vehicleDetailsService(id, payload) {
    const { body, image } = payload

    const riderProfile = await RiderRepository.updateRiderDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        "vehicle.image": image,
        ...body,
      }
    )

    if (!riderProfile) return { success: false, msg: RiderFailure.UPDATE }

    return {
      success: true,
      msg: RiderSuccess.UPDATE,
    }
  }

  static async updateRiderService(id, body) {
    const rider = await RiderRepository.updateRiderDetails(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        ...body,
      }
    )

    if (!rider) return { success: false, msg: RiderFailure.UPDATE }

    return {
      success: true,
      msg: RiderSuccess.UPDATE,
    }
  }

  static async fetchRiderService(query) {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "Rider"
    )

    if (error) return { success: false, msg: error }

    const rider = await RiderRepository.findAllRiderParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!rider)
      return {
        success: true,
        msg: RiderFailure.FETCH,
        data: [],
      }

    return {
      success: true,
      msg: RiderSuccess.FETCH,
      data: rider,
    }
  }

  static async verifyRider(body) {
    const { otp, email } = body

    const confirmOtp = await RiderRepository.findSingleRiderWithParams({
      verificationOtp: otp,
      email,
    })

    if (!confirmOtp) return { success: false, msg: AuthFailure.VERIFY_OTP }

    if (confirmOtp.isVerified)
      return { success: false, msg: AuthFailure.VERIFIED }

    confirmOtp.isVerified = true
    confirmOtp.verificationOtp = ""
    await confirmOtp.save()

    return {
      success: true,
      msg: AuthSuccess.VERIFY_OTP,
    }
  }

  static async resendOtpService(payload) {
    const { email, id } = payload
    const rider = await RiderRepository.findSingleRiderWithParams({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!rider) return { success: false, msg: AuthFailure.FETCH }

    const otp = AlphaNumeric(6)

    rider.verificationOtp = otp
    rider.email = email

    await rider.save()

    const substitutional_parameters = {
      name: rider.fullName,
      otp: otp,
    }

    await sendMailNotification(
      email,
      "OTP Verification",
      substitutional_parameters,
      "VERIFICATION"
    )

    return {
      success: true,
      msg: AuthSuccess.OTP_SENT,
    }
  }

  static async forgotPasswordService(payload) {
    const { email } = payload
    const rider = await RiderRepository.findSingleRiderWithParams({
      email: email,
    })

    if (!rider) return { success: false, msg: AuthFailure.FETCH }

    const { otp, expiry } = generateOtp()

    //save otp to compare
    rider.verificationOtp = otp
    await rider.save()

    /**send otp to email or phone number*/
    const substitutional_parameters = {
      resetOtp: otp,
    }

    await sendMailNotification(
      email,
      "Reset Password",
      substitutional_parameters,
      "RESET_OTP"
    )

    return { success: true, msg: AuthSuccess.OTP_SENT }
  }

  static async resetPassword(body) {
    const { newPassword, email, otp } = body

    const findRider = await RiderRepository.findSingleRiderWithParams({
      email,
      verificationOtp: otp,
    })

    if (!findRider) return { success: false, msg: AuthFailure.FETCH }

    findRider.password = await hashPassword(newPassword)
    findRider.verificationOtp = ""

    const saveRider = await findRider.save()

    if (!saveRider) return { success: false, msg: AuthFailure.PASSWORD_RESET }

    return { success: true, msg: AuthSuccess.PASSWORD_RESET }
  }
}
module.exports = { RiderService }
