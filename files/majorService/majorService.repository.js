const { MajorService } = require("./majorService.model")

class MajorServiceRepository {
  static async createMajorService(payload) {
    return await MajorService.create(payload)
  }

  static async findSingleMajorServiceByParams(payload) {
    return await MajorService.findOne({ ...payload })
  }

  static async MajorServiceExist(payload) {
    return await MajorService.exists({ ...payload })
  }

  static async fetchMajorServiceByParams(payload) {
    let { limit, skip, sort, ...restOfPayload } = payload

    const service = await MajorService.find({
      ...restOfPayload,
    })
      .populate({ path: "userId" })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return service
  }

  static async updateMajorServiceDetails(params, payload) {
    return await MajorService.findOneAndUpdate(
      { ...params },
      { ...payload },
      { new: true, runValidators: true }
    )
  }
}

module.exports = { MajorServiceRepository }
