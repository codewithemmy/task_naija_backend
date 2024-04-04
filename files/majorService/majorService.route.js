const serviceRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

serviceRoute.use(isAuthenticated)

const {
  createServiceController,
  fetchServiceController,
  updateServiceController,
  fetchServiceAggregateController,
} = require("./majorService.controller")

serviceRoute.route("/").post(createServiceController)
serviceRoute.route("/").get(fetchServiceController)
serviceRoute.route("/tasker").get(fetchServiceAggregateController)
serviceRoute.route("/:id").patch(updateServiceController)

module.exports = serviceRoute
