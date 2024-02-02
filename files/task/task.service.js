const mongoose = require("mongoose")
const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { TaskRepository } = require("./task.repository")
const { TaskFailure, TaskSuccess } = require("./task.messages")
const { UserRepository } = require("../user/user.repository")
const { UserFailure } = require("../user/user.messages")
const { sendMailNotification } = require("../../utils/email")

class TaskService {
  static async createTaskService(payload, locals) {
    const taskCount = await TaskRepository.findTaskWithParams(
      {
        assignedBy: new mongoose.Types.ObjectId(locals._id),
        assignedTo: new mongoose.Types.ObjectId(payload.assignedTo),
        contractStatus: "ongoing",
      },
      {}
    )

    if (taskCount.length >= 3)
      return {
        success: false,
        msg: TaskFailure.COUNT,
      }

    const task = await TaskRepository.create({
      assignedBy: new mongoose.Types.ObjectId(locals._id),
      ...payload,
    })

    if (!task) return { success: false, msg: TaskFailure.CREATE }

    return {
      success: true,
      msg: TaskSuccess.CREATE,
      task,
    }
  }

  static async startTaskService(payload, locals) {
    const tasker = await UserRepository.findSingleUserWithParams(
      {
        _id: new mongoose.Types.ObjectId(locals._id),
      },
      {}
    )

    if (!tasker) return { success: false, msg: UserFailure.USER_FOUND }
    const task = await TaskRepository.findSingleTaskWithParams({
      _id: payload,
    })

    if (!task) return { success: false, msg: TaskFailure.FETCH }

    task.status = "accepted"
    task.taskStatus = "ongoing"
    const saveStatus = await task.save()

    const user = await UserRepository.findSingleUserWithParams(
      {
        _id: new mongoose.Types.ObjectId(saveStatus.assignedBy),
      },
      {}
    )
    tasker.clients.push(saveStatus.assignedBy)
    await tasker.save()

    //send notification to user
    const substitutional_parameters = {
      assignee: user.firstName,
    }

    await sendMailNotification(
      contractor.email,
      "Task Status",
      substitutional_parameters,
      "TASK"
    )

    return {
      success: true,
      msg: TaskSuccess.ACCEPT,
    }
  }

  static async declineContractService(payload) {
    const task = await TaskRepository.findSingleTaskWithParams({
      _id: payload,
    })

    if (!task) return { success: false, msg: TaskFailure.DECLINE }

    task.taskStatus = "declined"
    await task.save()

    return {
      success: true,
      msg: TaskSuccess.DECLINE,
    }
  }

  static async endContractService(payload) {
    const task = await TaskRepository.findSingleTaskWithParams({
      _id: payload,
    })

    if (!task) return { success: false, msg: TaskFailure.END_TASK }

    task.taskStatus = "completed"
    await task.save()

    return {
      success: true,
      msg: TaskSuccess.DECLINE,
    }
  }

  static async getTaskService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Task"
    )
    if (error) return { success: false, msg: error }

    const task = await TaskRepository.findAllTaskParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (task.length < 1)
      return { success: true, msg: TaskFailure.FETCH, data: [] }

    return {
      success: true,
      msg: SubscriptionSuccess.FETCH,
      data: task,
    }
  }

  static async getTaskerService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "User"
    )
    if (error) return { success: false, msg: error }

    const tasker = await TaskRepository.findAllTaskers({
      ...params,
      limit,
      skip,
      sort,
    })

    if (tasker.length < 1) return { success: true, msg: TaskFailure.LOCATION }

    return { success: true, msg: TaskSuccess.TASKER, data: tasker }
  }

  static async rateTaskersService(id, payload, jwt) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!user) return { success: false, msg: TaskFailure.TASKER }

    const rate = await UserRepository.updateUserByParams(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        $push: {
          rating: { ratedBy: new mongoose.Types.ObjectId(jwt._id), ...payload },
        },
      }
    )

    if (!rate) return { success: false, msg: TaskFailure.UPDATE }

    return {
      success: true,
      msg: TaskSuccess.UPDATE,
    }
  }

  static async favoriteTaskerService(id, jwt, payload) {
    const { favorite } = payload
    const user = await UserRepository.findSingleUserWithParams({
      _id: new mongoose.Types.ObjectId(id),
      accountType: "Tasker",
    })

    if (!user) return { success: false, msg: TaskFailure.USER_FOUND }

    if (favorite) {
      const findFavourite = await UserRepository.findSingleUserWithParams({
        favoriteBy: { $in: [jwt._id] },
      })

      if (findFavourite)
        return { success: false, msg: `Already added as favorite` }

      const tasker = await UserRepository.updateUserByParams(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        {
          $push: {
            favoriteBy: jwt._id,
          },
        }
      )

      if (!tasker) return { success: false, msg: TaskFailure.UPDATE }

      return {
        success: true,
        msg: TaskSuccess.UPDATE,
      }
    }

    const findFavorite = await UserRepository.findSingleUserWithParams({
      favoriteBy: { $in: [jwt._id] },
    })

    if (!findFavorite)
      return { success: false, msg: `Tasker is currently not favorite` }

    const tasker = await UserRepository.updateUserByParams(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        $pull: {
          favoriteBy: jwt._id,
        },
      }
    )

    if (!tasker) return { success: false, msg: TaskFailure.UPDATE }

    return {
      success: true,
      msg: TaskSuccess.UPDATE,
    }
  }

  static async getFavoriteService(jwt) {
    const favorite = await UserRepository.findAllUsersParams({
      favoriteBy: { $in: [jwt._id] },
    })
    const taskers = await UserRepository.findAllUsersParams({
      clients: { $in: [jwt._id] },
    })

    if (!favorite && !taskers)
      return { success: true, msg: `No Favorite and No Taskers`, data: [] }

    return {
      success: true,
      msg: `Successful`,
      favorite,
      taskers,
    }
  }
}
module.exports = { TaskService }

//  static async getFavouriteService(jwt) {
//     const [favorites, taskers] = Promise.all([
//       await UserRepository.findAllUsersParams({
//         favoriteBy: { $in: [jwt._id] },
//       }),
//       await UserRepository.findAllUsersParams({
//         clients: { $in: [jwt._id] },
//       }),
//     ])

//     return {
//       success: true,
//       msg: `Successful`,
//       favorites,
//     }
//   }
