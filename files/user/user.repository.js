const { User } = require("./model/user.model")
const { TempUser } = require("./model/tempUser.model")
const mongoose = require("mongoose")

class UserRepository {
  static async create(payload) {
    return await User.create(payload)
  }

  static async createTemp(payload) {
    return await TempUser.create(payload)
  }

  static async findUserWithParams(userPayload, select) {
    return await User.find({ ...userPayload }).select(select)
  }

  static async findTempUserWithParams(userPayload, select) {
    return await TempUser.find({ ...userPayload }).select(select)
  }

  static async findSingleUserWithParams(userPayload, select) {
    const user = await User.findOne({ ...userPayload }).select(select)

    return user
  }
  static async findSingleTempUserWithParams(userPayload, select) {
    const user = await TempUser.findOne({ ...userPayload }).select(select)

    return user
  }

  static async validateUser(userPayload) {
    return User.exists({ ...userPayload })
  }
  static async validateTempUser(userPayload) {
    return TempUser.exists({ ...userPayload })
  }

  static async findAllUsersParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const user = await User.find({ ...restOfPayload }, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateUserProfile(payload, params) {
    return User.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async updateUserByParams(id, params) {
    return await User.findOneAndUpdate(
      { ...id },
      { ...params },
      { new: true, runValidators: true }
    )
  }
  static async updateTempUserByParams(id, params) {
    return await TempUser.findOne(
      { ...id },
      { ...params },
      { new: true, runValidators: true }
    )
  }

  static async deleteTempUserByParams(id) {
    return await TempUser.findOneAndDelete({ ...id })
  }
}

module.exports = { UserRepository }
