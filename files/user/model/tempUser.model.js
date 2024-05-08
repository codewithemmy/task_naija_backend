const mongoose = require("mongoose")

const tempUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: {
        validator: function (v) {
          // This regex is a simplified version to check for email format
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
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
