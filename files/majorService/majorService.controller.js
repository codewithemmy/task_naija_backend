const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { MajorService } = require("./MajorService.service")

const createServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    MajorService.createMajorService(req.body, res.locals.jwt._id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

const fetchServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    MajorService.fetchMajorService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

const fetchServiceAggregateController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    MajorService.fetchMajorServiceByAggregate(req.query)
  )
  console.log("error", error)
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

const updateServiceController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    MajorService.updateMajorService(req.body, req.params.id)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

module.exports = {
  createServiceController,
  fetchServiceController,
  updateServiceController,
  fetchServiceAggregateController,
}
