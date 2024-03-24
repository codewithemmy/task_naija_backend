const { User } = require("../user/model/user.model")
const { Task } = require("./task.model")
const mongoose = require("mongoose")

class TaskRepository {
  static async create(payload) {
    return Task.create(payload)
  }

  static async findTaskWithParams(payload, select) {
    return Task.find({ ...payload }).select(select)
  }

  static async findSingleTaskWithParams(payload, select) {
    return Task.findOne({ ...payload }).select(select)
  }

  static async validateTask(payload) {
    return Task.exists({ ...payload })
  }

  static async findAllTasksParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const Task = await Task.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return Task
  }

  //get curriculum
  static async findAllTaskParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const task = await Task.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return task
  }

  static async findAllTaskers(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    let { lat, lng, search, ...extraParams } = restOfPayload
    if (!search) search = ""

    if (lat && lng) {
      const user = await User.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            key: "locationCoord",
            maxDistance: parseFloat(10000),
            distanceField: "distance",
            spherical: true,
            distanceMultiplier: 0.001,
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { firstName: { $regex: search, $options: "i" } },
                  { lastName: { $regex: search, $options: "i" } },
                  { availabilityRates: { $regex: search, $options: "i" } },
                ],
              },
              { ...extraParams },
              { accountType: "Tasker" },
            ],
          },
        },
      ])
        .sort(sort)
        .skip(skip)
        .limit(limit)

      return user
    }
    const user = await User.aggregate([
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { availabilityRates: { $regex: search, $options: "i" } },
              ],
            },
            { ...extraParams },
            { accountType: "Tasker" },
          ],
        },
      },
    ])
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }
}

module.exports = { TaskRepository }
