const express = require("express");
const router = express.Router();
const voucherController = require("../controller/vouchers");
const { loginCheck } = require("../middleware/auth");

// Public route - Validate voucher (for checkout)
router.post("/validate", voucherController.validateVoucher);

// Admin routes - require authentication
router.get("/all-voucher", loginCheck, voucherController.getAllVouchers);
router.post("/single-voucher", loginCheck, voucherController.getVoucherById);
router.post("/add-voucher", loginCheck, voucherController.postCreateVoucher);
router.post("/edit-voucher", loginCheck, voucherController.postUpdateVoucher);
router.post("/delete-voucher", loginCheck, voucherController.postDeleteVoucher);
router.post("/increment-usage", loginCheck, voucherController.incrementUsage);

module.exports = router;

