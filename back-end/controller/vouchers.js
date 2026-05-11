const voucherModel = require("../models/vouchers");

class Voucher {
  // Get all vouchers
  async getAllVouchers(req, res) {
    try {
      let vouchers = await voucherModel.find({}).sort({ createdAt: -1 });
      if (vouchers) {
        return res.json({ vouchers });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Get voucher by ID
  async getVoucherById(req, res) {
    try {
      let { vId } = req.body;
      let voucher = await voucherModel.findById(vId);
      if (voucher) {
        return res.json({ voucher });
      } else {
        return res.json({ error: "Voucher not found" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Create new voucher
  async postCreateVoucher(req, res) {
    let {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      status,
    } = req.body;

    if (!code || !name || !type || !value || !startDate || !endDate) {
      return res.json({ error: "All required fields must be filled" });
    }

    // Validate type and value
    if (type === "percentage" && (value < 0 || value > 100)) {
      return res.json({ error: "Percentage must be between 0 and 100" });
    }

    if (type === "fixed" && value <= 0) {
      return res.json({ error: "Fixed discount must be greater than 0" });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.json({ error: "End date must be after start date" });
    }

    try {
      // Check if code already exists
      const existingVoucher = await voucherModel.findOne({ code: code.toUpperCase() });
      if (existingVoucher) {
        return res.json({ error: "Voucher code already exists" });
      }

      let newVoucher = new voucherModel({
        code: code.toUpperCase(),
        name,
        description: description || "",
        type,
        value: parseFloat(value),
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || "active",
        used: 0,
      });

      let save = await newVoucher.save();
      if (save) {
        return res.json({
          success: true,
          message: "Voucher created successfully",
          voucher: save,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Update voucher
  async postUpdateVoucher(req, res) {
    let {
      vId,
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      status,
    } = req.body;

    if (!vId) {
      return res.json({ error: "Voucher ID is required" });
    }

    try {
      let voucher = await voucherModel.findById(vId);
      if (!voucher) {
        return res.json({ error: "Voucher not found" });
      }

      // Validate type and value if provided
      if (type === "percentage" && value !== undefined && (value < 0 || value > 100)) {
        return res.json({ error: "Percentage must be between 0 and 100" });
      }

      if (type === "fixed" && value !== undefined && value <= 0) {
        return res.json({ error: "Fixed discount must be greater than 0" });
      }

      // Validate dates if provided
      const newStartDate = startDate ? new Date(startDate) : voucher.startDate;
      const newEndDate = endDate ? new Date(endDate) : voucher.endDate;
      if (newStartDate >= newEndDate) {
        return res.json({ error: "End date must be after start date" });
      }

      // Check if code already exists (if changed)
      if (code && code.toUpperCase() !== voucher.code) {
        const existingVoucher = await voucherModel.findOne({
          code: code.toUpperCase(),
          _id: { $ne: vId },
        });
        if (existingVoucher) {
          return res.json({ error: "Voucher code already exists" });
        }
      }

      // Update fields
      if (code) voucher.code = code.toUpperCase();
      if (name) voucher.name = name;
      if (description !== undefined) voucher.description = description;
      if (type) voucher.type = type;
      if (value !== undefined) voucher.value = parseFloat(value);
      if (minOrderAmount !== undefined) voucher.minOrderAmount = parseFloat(minOrderAmount);
      if (maxDiscountAmount !== undefined) {
        voucher.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
      }
      if (usageLimit !== undefined) {
        voucher.usageLimit = usageLimit ? parseInt(usageLimit) : null;
      }
      if (startDate) voucher.startDate = new Date(startDate);
      if (endDate) voucher.endDate = new Date(endDate);
      if (status) voucher.status = status;

      let update = await voucher.save();
      if (update) {
        return res.json({
          success: true,
          message: "Voucher updated successfully",
          voucher: update,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Delete voucher
  async postDeleteVoucher(req, res) {
    let { vId } = req.body;
    if (!vId) {
      return res.json({ error: "Voucher ID is required" });
    }

    try {
      let deleteVoucher = await voucherModel.findByIdAndDelete(vId);
      if (deleteVoucher) {
        return res.json({
          success: true,
          message: "Voucher deleted successfully",
        });
      } else {
        return res.json({ error: "Voucher not found" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Validate voucher code (for checkout)
  async validateVoucher(req, res) {
    let { code, orderAmount } = req.body;

    if (!code) {
      return res.json({ error: "Voucher code is required" });
    }

    if (!orderAmount || orderAmount <= 0) {
      return res.json({ error: "Invalid order amount" });
    }

    try {
      const voucher = await voucherModel.findOne({ code: code.toUpperCase() });

      if (!voucher) {
        return res.json({ error: "Voucher code không tồn tại" });
      }

      // Check status
      if (voucher.status !== "active") {
        return res.json({ error: "Voucher không còn hoạt động" });
      }

      // Check date validity
      const now = new Date();
      if (now < voucher.startDate) {
        return res.json({ error: "Voucher chưa đến thời gian áp dụng" });
      }

      if (now > voucher.endDate) {
        return res.json({ error: "Voucher đã hết hạn" });
      }

      // Check usage limit
      if (voucher.usageLimit !== null && voucher.used >= voucher.usageLimit) {
        return res.json({ error: "Voucher đã hết lượt sử dụng" });
      }

      // Check minimum order amount
      if (orderAmount < voucher.minOrderAmount) {
        return res.json({
          error: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString("vi-VN")}đ để áp dụng voucher này`,
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (voucher.type === "percentage") {
        discountAmount = (orderAmount * voucher.value) / 100;
        // Apply max discount if set
        if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
          discountAmount = voucher.maxDiscountAmount;
        }
      } else {
        // Fixed amount
        discountAmount = voucher.value;
        // Can't discount more than order amount
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
      }

      const finalAmount = Math.max(0, orderAmount - discountAmount);

      return res.json({
        success: true,
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          name: voucher.name,
          type: voucher.type,
          value: voucher.value,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
        },
      });
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }

  // Increment voucher usage count (called when order is created)
  async incrementUsage(req, res) {
    let { vId } = req.body;
    if (!vId) {
      return res.json({ error: "Voucher ID is required" });
    }

    try {
      const voucher = await voucherModel.findById(vId);
      if (!voucher) {
        return res.json({ error: "Voucher not found" });
      }

      voucher.used = (voucher.used || 0) + 1;
      await voucher.save();

      return res.json({ success: true });
    } catch (err) {
      console.log(err);
      return res.json({ error: err.message });
    }
  }
}

module.exports = new Voucher();

