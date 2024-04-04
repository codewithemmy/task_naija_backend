const mongoose = require("mongoose")

const MajorServiceSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    price: { type: String },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

const majorService = mongoose.model(
  "MajorService",
  MajorServiceSchema,
  "majorService"
)

module.exports = { MajorService: majorService }
