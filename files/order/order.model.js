const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String },
    trackingId: { type: String },
    amount: { type: Number },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    riderId: {
      type: mongoose.Types.ObjectId,
      ref: "Rider",
    },
    addressDetails: {
      houseNumber: { type: Number },
      landMark: { type: String },
      contactNumber: { type: String },
      lng: { type: Number },
      lat: { type: Number },
    },
    receiverDetails: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      lng: { type: Number },
      lat: { type: Number },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "cancelled",
        "on-going",
        "successful",
        "accepted",
        "rejected",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
    deliveryService: { 
      type: String,
      enum: ["standard", "bulk", "neutral"],
      default: "neutral",
    },
    deliveryOption: {
      type: String,
      enum: ["express", "normal"],
      default: "normal",
    },
    ratings: [
      {
        rate: Number,
        review: String,
        ratedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],
    averageRating: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 50000 },
    lat: { type: Number },
    lng: { type: Number },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

const order = mongoose.model("Order", OrderSchema, "order")

module.exports = { Order: order }
