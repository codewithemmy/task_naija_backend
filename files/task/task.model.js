const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    taskStatus: {
      type: String,
      enum: ["pending", "ongoing", "completed", "waiting", "declined"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["accepted", "declined", "pending"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    declineReason: { type: String },
  },
  { timestamps: true }
)

const task = mongoose.model("Task", taskSchema, "task")

module.exports = { Task: task }
