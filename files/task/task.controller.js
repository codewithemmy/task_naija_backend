const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { TaskService } = require("./task.service")

const createTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.createTaskService(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const startTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.startTaskService(req.params.id, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const declineTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.declineContractService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const endTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.endTaskService(req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.getTaskService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getTaskersController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.getTaskerService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const rateTaskersController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.rateTaskersService(req.params.id, req.body, res.locals.jwt)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const favoriteTaskerController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.favoriteTaskerService(req.params.id, res.locals.jwt, req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getFavoriteController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.getFavoriteService(res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createTaskController,
  startTaskController,
  declineTaskController,
  endTaskController,
  getTaskController,
  getTaskersController,
  rateTaskersController,
  favoriteTaskerController,
  getFavoriteController,
}
