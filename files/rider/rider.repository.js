const { Rider } = require("./rider.model")
const mongoose = require("mongoose")

class RiderRepository {
  static async create(payload) {
    return await Rider.create(payload)
  }

  static async findRiderWithParams(payload, select) {
    return await Rider.find({ ...payload }).select(select)
  }

  static async findSingleRiderWithParams(payload, select) {
    const rider = await Rider.findOne({ ...payload }).select(select)

    return rider
  }

  static async validateRider(payload) {
    return Rider.exists({ ...payload })
  }

  static async findAllRiderParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const rider = await Rider.find({ ...restOfPayload }, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return rider
  }

  static async updateRiderDetails(payload, params) {
    return Rider.findOneAndUpdate(
      { ...payload },
      { ...params } //returns details about the update
    )
  }

  static async updateRiderProfile(payload, params) {
    return Rider.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async updateRiderById(id, params) {
    return await Rider.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { ...params } }
    )
  }
}

module.exports = { RiderRepository }
