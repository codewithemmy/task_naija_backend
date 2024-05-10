const mongoose = require("mongoose")
require("../../utils/passport")
const { tokenHandler } = require("../../utils")
const { UserRepository } = require("../user/user.repository")

class GoogleAuthService {
  static async googleSuccessService(payload) {
    const { email, _json } = payload

    const userExist = await UserRepository.validateUser({
      email,
    })

    const { given_name, family_name } = _json

    if (!userExist) {
      const user = await UserRepository.create({
        email,
        firstName: family_name,
        lastName: given_name,
        loginType: "auth-login",
        isVerified: true,
      })

      if (!user._id) return { success: false, msg: `unable to authenticate` }

      // if (!user.accountType)
      //   return { success: false, msg: `Update your account type` }

      token = await tokenHandler({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      })

      const result = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        ...token,
      }

      return {
        success: true,
        msg: `successful`,
        data: result,
      }
    } else {
      const user = await UserRepository.findSingleUserWithParams({ email })

      // if (!user.accountType)
      //   return { success: false, msg: `Update your account type` }

      let token = await tokenHandler({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
      })

      const result = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        ...token,
      }

      return {
        success: true,
        msg: `successful`,
        data: result,
      }
    }
  }

  static async googleFailureService() {
    return {
      success: true,
      msg: `Something Went Wrong trying to get Authenticated`,
    }
  }
}

module.exports = GoogleAuthService
