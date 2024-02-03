const textRoute = require("express").Router()
const { isAuthenticated } = require("../../../utils")
const { uploadManager } = require("../../../utils/multer")
const {
  sendTextController,
  fetchTextsController,
} = require("./text.controller")

textRoute.use(isAuthenticated)

//routes
textRoute
  .route("/")
  .post(uploadManager("textImage").single("image"), sendTextController)
  .get(fetchTextsController)

module.exports = textRoute
