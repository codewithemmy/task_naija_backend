const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { UserService } = require("./user.service")

const createUserController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.createUserService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const createTaskerController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.createTaskerService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const resentUserOtp = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.resendOtpService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const verifyUserOtp = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.verifyUserOtp(req.body)
  )

  if (error) return next(error)
  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}
const userPasswordController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.userPasswordService(req.body)
  )

  if (error) return next(error)
  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userLoginController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.userLoginService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userUpdateController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.updateProfileService(res.locals.jwt._id, req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userImageController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    UserService.imageUploadService(res.locals.jwt._id, value)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userVideoController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    UserService.videoUploadService(res.locals.jwt._id, value)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userDocumentController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    UserService.documentUploadService(res.locals.jwt._id, value)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createUserController,
  resentUserOtp,
  userLoginController,
  userUpdateController,
  verifyUserOtp,
  userPasswordController,
  createTaskerController,
  userImageController,
  userVideoController,
  userDocumentController,
}
