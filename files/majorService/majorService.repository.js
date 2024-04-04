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
      .populate({
        path: "userId",
        select:
          "_id mobile averageRating firstName firstName addressLine city email profileImage",
      })
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

  static async findMajorServiceAggregate(payload) {
    let { limit, skip, sort, search, averageRating, amount, ...restOfPayload } =
      payload

    if (!search) search = ""
    if (!averageRating) averageRating = null
    if (!amount) amount = null

    const service = await MajorService.aggregate([
      {
        $addFields: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "_id",
          as: "tasker",
          pipeline: [
            {
              $project: {
                _id: 1,
                mobile: 1,
                averageRating: 1,
                averageRating: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  "tasker.averageRating": averageRating,
                },
                {
                  amount,
                },
                {
                  name: {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
              ...restOfPayload,
            },
          ],
        },
      },
    ])
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return service
  }
}

module.exports = { MajorServiceRepository }
