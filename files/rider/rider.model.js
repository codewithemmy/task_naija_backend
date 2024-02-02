const mongoose = require("mongoose")

const riderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    password: { type: String },
    profileImage: { type: String },
    vehicle: {
      image: String,
      vehicleType: String,
      brand: String,
      plateNumber: String,
    },
    guarantors: {
      nameOne: String,
      phoneOne: String,
      nameTwo: String,
      phoneTwo: String,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordToken: {
      type: String,
    },
    verificationOtp: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    verified: { type: Date, default: Date.now() },
  },
  { timestamps: true }
)

const rider = mongoose.model("Rider", riderSchema, "rider")

module.exports = { Rider: rider }
