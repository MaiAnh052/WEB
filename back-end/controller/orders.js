const orderModel = require("../models/orders");
const voucherModel = require("../models/vouchers");
const productModel = require("../models/products");

// Helper function để giảm số lượng kho
const reduceProductStock = async (allProduct) => {
  try {
    for (const item of allProduct) {
      const product = await productModel.findById(item.id);
      if (!product) {
        continue;
      }

      const quantityToDeduct = parseInt(item.quantitiy) || 1;

      // Nếu có variant, giảm số lượng variant
      if (item.variant && item.variant.size && item.variant.color) {
        const variantIndex = product.pVariants.findIndex(
          (v) => v.size === item.variant.size && v.color === item.variant.color
        );

        if (variantIndex !== -1 && product.pVariants[variantIndex].quantity >= quantityToDeduct) {
          product.pVariants[variantIndex].quantity -= quantityToDeduct;
          
          // Cập nhật lại tổng số lượng từ tất cả variants
          const totalQuantity = product.pVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
          product.pQuantity = totalQuantity;
        } else {
          throw new Error(`Không đủ hàng cho sản phẩm ${product.pName} - ${item.variant.size}/${item.variant.color}`);
        }
      } else {
        // Không có variant, giảm số lượng tổng
        if (product.pQuantity >= quantityToDeduct) {
          product.pQuantity -= quantityToDeduct;
        } else {
          throw new Error(`Không đủ hàng cho sản phẩm ${product.pName}`);
        }
      }

      await product.save();
    }
    return { success: true };
  } catch (err) {
    console.log("Error updating stock:", err);
    return { success: false, error: err.message };
  }
};

class Order {
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.json({ Orders });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderByUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "pName pImages pPrice")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postCreateOrder(req, res) {
    let { allProduct, user, amount, transactionId, address, phone, paymentMethod, voucherCode, voucherId, discountAmount } = req.body;
    if (
      !allProduct ||
      !user ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        // Tính lại giá gốc từ allProduct để đảm bảo đúng
        // Ưu tiên giá từ variant, nếu không có thì dùng giá từ product
        let calculatedBaseAmount = 0;
        if (allProduct && Array.isArray(allProduct)) {
          allProduct.forEach((item) => {
            let itemPrice = 0;
            if (item.variant && item.variant.price) {
              // Có variant, dùng giá từ variant (ưu tiên nhất)
              itemPrice = parseFloat(item.variant.price);
            } else if (item.id && typeof item.id === 'object' && item.id.pPrice) {
              // Product đã được populate, dùng giá mặc định
              itemPrice = parseFloat(item.id.pPrice);
            } else if (item.price) {
              // Fallback: giá từ item
              itemPrice = parseFloat(item.price);
            }
            calculatedBaseAmount += itemPrice * (parseInt(item.quantitiy) || 1);
          });
        }

        // Luôn ưu tiên calculatedBaseAmount (tính từ variant/product)
        // Nếu không tính được, thì kiểm tra xem amount có bị giảm không
        let baseAmount = calculatedBaseAmount > 0 ? calculatedBaseAmount : parseFloat(amount || 0);
        
        // Nếu có discountAmount và amount có vẻ đã bị giảm (amount + discountAmount = calculatedBaseAmount)
        // Hoặc nếu calculatedBaseAmount = 0 nhưng có discountAmount, tính lại từ amount + discount
        if (calculatedBaseAmount === 0 && discountAmount > 0 && amount) {
          // Không tính được từ allProduct, nhưng có discount, có thể amount đã bị giảm
          baseAmount = parseFloat(amount) + parseFloat(discountAmount);
        } else if (calculatedBaseAmount > 0) {
          // Ưu tiên dùng calculatedBaseAmount (từ variant/product)
          baseAmount = calculatedBaseAmount;
        }

        // Calculate final amount từ giá gốc
        const discount = parseFloat(discountAmount || 0);
        const finalAmount = Math.max(0, baseAmount - discount);

        // Giảm số lượng kho TRƯỚC KHI tạo order (cho cả COD và VNPay)
        // Với COD: giảm ngay khi đặt hàng
        // Với VNPay: sẽ giảm khi thanh toán thành công (xử lý trong vnpay.js)
        if (paymentMethod === "COD") {
          const stockResult = await reduceProductStock(allProduct);
          if (!stockResult.success) {
            return res.json({ 
              error: stockResult.error || "Không đủ hàng trong kho" 
            });
          }
        }

        let newOrder = new orderModel({
          allProduct,
          user,
          amount: baseAmount, // Lưu giá gốc vào amount
          transactionId,
          address,
          phone,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: paymentMethod === "VNPAY" ? "pending" : "pending",
          voucherCode: voucherCode || null,
          voucherId: voucherId || null,
          discountAmount: discount,
          finalAmount: finalAmount,
        });
        let save = await newOrder.save();

        // Increment voucher usage if voucher was used
        if (voucherId) {
          try {
            const voucher = await voucherModel.findById(voucherId);
            if (voucher) {
              voucher.used = (voucher.used || 0) + 1;
              await voucher.save();
            }
          } catch (voucherErr) {
            console.log("Error incrementing voucher usage:", voucherErr);
          }
        }

        if (save) {
          return res.json({ 
            success: true,
            message: "Order created successfully",
            orderId: save._id.toString()
          });
        }
      } catch (err) {
        return res.json({ error: err.message });
      }
    }
  }

  async postUpdateOrder(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postDeleteOrder(req, res) {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const ordersController = new Order();
module.exports = ordersController;
