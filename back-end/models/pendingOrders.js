const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const pendingOrderSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    allProduct: [
      {
        id: { type: ObjectId, ref: "products" },
        quantitiy: Number,
        variant: {
          size: String,
          color: String,
          price: Number,
        },
      },
    ],
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "VNPAY",
    },
    voucherCode: {
      type: String,
      default: null,
    },
    voucherId: {
      type: ObjectId,
      ref: "vouchers",
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 phút
      index: { expireAfterSeconds: 0 }, // Tự động xóa sau khi hết hạn
    },
  },
  { timestamps: true }
);

const pendingOrderModel = mongoose.model("pendingOrders", pendingOrderSchema);
module.exports = pendingOrderModel;

