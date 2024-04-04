const mongoose = require("mongoose")
const { MajorServiceRepository } = require("./majorService.repository")
const { queryConstructor } = require("../../utils/index")
const { serviceMessage } = require("./majorService.messages")

class MajorService {
  static async createMajorService(payload, params) {
    const service = await MajorServiceRepository.createMajorService({
      ...payload,
      userId: new mongoose.Types.ObjectId(params),
    })

    if (!service) return { success: false, msg: serviceMessage.SERVICE_ERROR }

    return { success: true, msg: serviceMessage.SERVICE_CREATED }
  }

  static async fetchMajorService(query) {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "MajorService"
    )

    if (error) return { success: false, msg: error }

    const service = await MajorServiceRepository.fetchMajorServiceByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!service)
      return {
        success: true,
        msg: serviceMessage.SERVICE_NOT_FOUND,
        data: [],
      }

    return {
      success: true,
      msg: serviceMessage.SERVICE_FETCHED,
      data: service,
    }
  }

  static async updateMajorService(payload, params) {
    const service = await MajorServiceRepository.findSingleMajorServiceByParams(
      {
        _id: new mongoose.Types.ObjectId(params),
      }
    )

    if (!service)
      return { success: true, msg: serviceMessage.SERVICE_NOT_FOUND, data: [] }

    const majorService = await ServiceRepository.updateServiceDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      { ...payload }
    )

    if (!majorService)
      return { success: false, msg: serviceMessage.UPDATE_ERROR }

    return {
      success: true,
      msg: serviceMessage.UPDATE,
    }
  }
}

module.exports = { MajorService }
