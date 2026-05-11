const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"], // percentage: giảm theo %, fixed: giảm giá cố định
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0, // Đơn hàng tối thiểu để áp dụng voucher
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Giới hạn số tiền giảm tối đa (cho loại percentage)
    },
    usageLimit: {
      type: Number,
      default: null, // null = không giới hạn số lần sử dụng
    },
    used: {
      type: Number,
      default: 0, // Số lần đã sử dụng
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Index for faster lookups
voucherSchema.index({ code: 1 });
voucherSchema.index({ status: 1, startDate: 1, endDate: 1 });

const voucherModel = mongoose.model("vouchers", voucherSchema);
module.exports = voucherModel;

