const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    mobile: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    accountType: { type: String, enum: ["Tasker", "User"] },
    favoriteBy: [{ type: String }],
    clients: [{ type: String }],
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    addressLine: { type: String },
    unit: { type: String },
    city: { type: String },
    postalCode: { type: String },
    profileImage: { type: String },
    profileVideo: { type: String },
    skills: { type: String },
    availabilityRates: { type: String },
    certification: { type: String },
    document: { type: String },
    rating: [
      {
        rate: { type: Number, default: 0 },
        review: { type: String },
        ratedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now() },
      },
    ],
    averageRating: { type: Number, default: 0 },
    locationCoord: {
      type: { type: String },
      coordinates: [],
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

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate()
    const user = await this.model.findOne(this.getQuery())

    // Calculate average rating only if there are ratings
    if (user.rating && user.rating.length > 0) {
      const totalRating = user.rating.reduce(
        (sum, current) => sum + current.rate,
        0
      )
      update.$set = update.$set || {}
      update.$set.averageRating = totalRating / user.rating.length
    } else {
      // Set default averageRating if there are no ratings
      update.$set = update.$set || {}
      update.$set.averageRating = 0
    }

    // Call next to continue with the findOneAndUpdate operation
    next()
  } catch (error) {
    // Handle any errors during the calculation
    next(error)
  }
})

userSchema.index({ locationCoord: "2dsphere" })

const user = mongoose.model("User", userSchema, "user")

module.exports = { User: user }
