const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps, fileModifier } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { RiderService } = require("./rider.service")

const createRiderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.createRiderService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const riderLoginController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.riderLoginService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const vehicleDetailsController = async (req, res, next) => {
  const value = await fileModifier(req)
  const [error, data] = await manageAsyncOps(
    RiderService.vehicleDetailsService(res.locals.jwt._id, value)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const updateRiderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.updateRiderService(res.locals.jwt._id, req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const verifyRiderController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(RiderService.verifyRider(req.body))

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const resentOtpController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.resendOtpService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const forgotPasswordController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.forgotPasswordService(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const resetPasswordController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    RiderService.resetPassword(req.body)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createRiderController,
  riderLoginController,
  vehicleDetailsController,
  updateRiderController,
  verifyRiderController,
  resentOtpController,
  forgotPasswordController,
  resetPasswordController,
}
