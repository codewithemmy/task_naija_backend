const mongoose = require("mongoose")

const tempUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    accountType: { type: String },
    verificationOtp: {
      type: String,
    },
  },
  { timestamps: true }
)

const tempUser = mongoose.model("TempUser", tempUserSchema, "tempUser")

module.exports = { TempUser: tempUser }
