const taskRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

const {
  createTaskController,
  endTaskController,
  startTaskController,
  declineTaskController,
  getTaskController,
  getTaskersController,
  rateTaskersController,
  favoriteTaskerController,
  getFavoriteController,
} = require("./task.controller")

taskRoute.use(isAuthenticated)

//routes
taskRoute.route("/").get(getTaskController)
taskRoute.route("/").post(createTaskController)
taskRoute.route("/end/:id").put(endTaskController)
taskRoute.route("/start/:id").put(startTaskController)
taskRoute.route("/decline/:id").put(declineTaskController)
taskRoute.route("/taskers").get(getTaskersController)
taskRoute.route("/tasker/rate/:id").patch(rateTaskersController)
taskRoute.route("/tasker/favorite/:id").patch(favoriteTaskerController)
taskRoute.route("/tasker/favorite").get(getFavoriteController)

module.exports = taskRoute
