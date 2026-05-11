const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay");
const orderModel = require("../models/orders");
const pendingOrderModel = require("../models/pendingOrders");
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

// Helper function để tính giá gốc từ allProduct
const calculateBaseAmountFromProducts = async (allProduct) => {
  let calculatedBaseAmount = 0;
  if (allProduct && Array.isArray(allProduct)) {
    for (const item of allProduct) {
      let itemPrice = 0;
      if (item.variant && item.variant.price) {
        // Có variant, dùng giá từ variant
        itemPrice = item.variant.price;
      } else if (item.id && typeof item.id === 'object' && item.id.pPrice) {
        // Product đã được populate
        itemPrice = item.id.pPrice;
      } else if (item.id && typeof item.id === 'string') {
        // Product chưa được populate, cần query
        try {
          const product = await productModel.findById(item.id);
          itemPrice = product?.pPrice || 0;
        } catch (err) {
          itemPrice = 0;
        }
      } else if (item.price) {
        // Fallback: giá từ item
        itemPrice = item.price;
      }
      calculatedBaseAmount += itemPrice * (item.quantitiy || 1);
    }
  }
  return calculatedBaseAmount;
};

class VNPayController {
  async createPaymentUrl(req, res) {
    try {
      const { orderId, amount, orderDescription, ipAddr, orderData } = req.body;

      if (!orderId || !amount) {
        return res.json({ 
          error: "Order ID and amount are required" 
        });
      }

      if (orderData) {
        try {
          // Tính lại giá gốc từ allProduct để đảm bảo lưu đúng vào pendingOrder
          let calculatedBaseAmount = 0;
          if (orderData.allProduct && Array.isArray(orderData.allProduct)) {
            orderData.allProduct.forEach((item) => {
              let itemPrice = 0;
              if (item.variant && item.variant.price) {
                itemPrice = parseFloat(item.variant.price);
              } else if (item.price) {
                itemPrice = parseFloat(item.price);
              }
              calculatedBaseAmount += itemPrice * (parseInt(item.quantitiy) || 1);
            });
          }

          // Sử dụng calculatedBaseAmount nếu có, nếu không thì dùng amount
          const baseAmount = calculatedBaseAmount > 0 ? calculatedBaseAmount : parseFloat(orderData.amount);
          const discountAmount = orderData.discountAmount || 0;
          const finalAmount = Math.max(0, baseAmount - discountAmount);
          
          const pendingOrder = new pendingOrderModel({
            transactionId: orderId.toString(),
            allProduct: orderData.allProduct,
            user: orderData.user,
            amount: baseAmount, // Lưu giá gốc
            address: orderData.address,
            phone: orderData.phone,
            paymentMethod: orderData.paymentMethod || "VNPAY",
            voucherCode: orderData.voucherCode || null,
            voucherId: orderData.voucherId || null,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
          });
          await pendingOrder.save();
        } catch (error) {
        }
      }

      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                       req.headers['x-real-ip'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       "127.0.0.1";

      const cleanDescription = (orderDescription || `Thanh toan don hang ${orderId}`)
        .replace(/[#&<>"']/g, "")
        .trim()
        .substring(0, 255);

      let cleanOrderId = orderId.toString().replace(/[^a-zA-Z0-9]/g, "");
      if (!cleanOrderId || cleanOrderId.length === 0) {
        cleanOrderId = Date.now().toString();
      }

      // Use finalAmount from orderData if available, otherwise use amount
      const finalAmount = orderData?.finalAmount ? parseFloat(orderData.finalAmount) : parseFloat(amount);
      if (isNaN(finalAmount) || finalAmount <= 0) {
        return res.json({ 
          error: "Invalid amount: " + finalAmount 
        });
      }

      const paymentUrl = createPaymentUrl({
        orderId: cleanOrderId,
        amount: finalAmount,
        orderDescription: cleanDescription || `Thanh toan don hang ${cleanOrderId}`,
        ipAddr: clientIp,
      });
      return res.json({ 
        success: true,
        paymentUrl 
      });
    } catch (error) {
      return res.json({ 
        error: "Failed to create payment URL: " + error.message 
      });
    }
  }

  /**
   * Xử lý callback từ VNPay (Return URL)
   */
  async vnpayReturn(req, res) {
    try {
      const vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];
      const isValid = verifyReturnUrl({ ...vnp_Params });
      const responseCode = vnp_Params["vnp_ResponseCode"];
      
      if (!isValid && responseCode !== "00") {
        return res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&message=Invalid checksum&vnp_ResponseCode=${responseCode || ""}`
        );
      }

      const transactionId = vnp_Params["vnp_TxnRef"];
      const transactionNo = vnp_Params["vnp_TransactionNo"];
      const amount = parseInt(vnp_Params["vnp_Amount"]) / 100;
      const bankCode = vnp_Params["vnp_BankCode"];
      const bankTranNo = vnp_Params["vnp_BankTranNo"];
      if (responseCode === "00") {
        try {
          const existingOrder = await orderModel.findOne({ 
            vnp_TransactionNo: transactionNo 
          });

          if (existingOrder) {
            return res.redirect(
              `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=success&orderId=${existingOrder._id}`
            );
          }

          const pendingOrder = await pendingOrderModel.findOne({ transactionId: transactionId });
          
          if (!pendingOrder) {
            return res.redirect(
              `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&message=Order data not found`
            );
          }

          // Tính lại giá gốc từ allProduct để đảm bảo đúng
          const calculatedBaseAmount = await calculateBaseAmountFromProducts(pendingOrder.allProduct);
          
          // Tính lại baseAmount
          let baseAmount = calculatedBaseAmount > 0 ? calculatedBaseAmount : pendingOrder.amount;
          // Nếu amount nhỏ hơn calculatedBaseAmount và có discount, có thể amount đã bị giảm
          if (pendingOrder.discountAmount > 0 && pendingOrder.amount < calculatedBaseAmount) {
            baseAmount = pendingOrder.amount + pendingOrder.discountAmount;
          }

          const discount = pendingOrder.discountAmount || 0;
          const finalAmount = Math.max(0, baseAmount - discount);

          const newOrder = new orderModel({
            allProduct: pendingOrder.allProduct,
            user: pendingOrder.user,
            amount: baseAmount, // Giá gốc
            transactionId: transactionNo,
            address: pendingOrder.address,
            phone: pendingOrder.phone,
            paymentMethod: "VNPAY",
            paymentStatus: "paid",
            vnp_TransactionNo: transactionNo,
            status: "Processing",
            voucherCode: pendingOrder.voucherCode || null,
            voucherId: pendingOrder.voucherId || null,
            discountAmount: discount,
            finalAmount: finalAmount,
          });

          // Giảm số lượng kho
          const stockResult = await reduceProductStock(pendingOrder.allProduct);
          if (!stockResult.success) {
            return res.redirect(
              `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&message=${encodeURIComponent(stockResult.error)}`
            );
          }

          const savedOrder = await newOrder.save();

          // Increment voucher usage if voucher was used
          if (pendingOrder.voucherId) {
            try {
              const voucher = await voucherModel.findById(pendingOrder.voucherId);
              if (voucher) {
                voucher.used = (voucher.used || 0) + 1;
                await voucher.save();
              }
            } catch (voucherErr) {
              console.log("Error incrementing voucher usage:", voucherErr);
            }
          }
          await pendingOrderModel.deleteOne({ transactionId: transactionId });

          return res.redirect(
            `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=success&orderId=${savedOrder._id}`
          );
        } catch (error) {
          return res.redirect(
            `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&message=Error creating order`
          );
        }
      } else {
        let errorMessage = "Giao dịch thanh toán không thành công";
        const responseCodeMessages = {
          "07": "Giao dịch bị nghi ngờ (fraud)",
          "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking",
          "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
          "11": "Đã hết hạn chờ thanh toán",
          "12": "Thẻ/Tài khoản bị khóa",
          "24": "Khách hàng hủy giao dịch",
          "51": "Tài khoản không đủ số dư để thực hiện giao dịch",
          "65": "Tài khoản đã vượt quá hạn mức giao dịch",
          "75": "Ngân hàng thanh toán đang bảo trì",
          "99": "Lỗi không xác định"
        };
        
        if (responseCodeMessages[responseCode]) {
          errorMessage = responseCodeMessages[responseCode];
        }
        
        try {
          await pendingOrderModel.deleteOne({ transactionId: transactionId });
        } catch (error) {
        }
        
        const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&code=${responseCode || "unknown"}&message=${encodeURIComponent(errorMessage)}&vnp_ResponseCode=${responseCode || ""}&vnp_TransactionNo=${transactionNo || ""}&vnp_Amount=${vnp_Params["vnp_Amount"] || ""}`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/vnpay-return?status=failed&message=Server error`
      );
    }
  }

  async confirmPaymentFromFrontend(req, res) {
    try {
      const { transactionId, vnpTransactionNo, vnpResponseCode } = req.body;

      if (!transactionId || !vnpTransactionNo || vnpResponseCode !== "00") {
        return res.json({ 
          error: "Invalid parameters or payment not successful" 
        });
      }

      const existingOrder = await orderModel.findOne({ 
        vnp_TransactionNo: vnpTransactionNo 
      });

      if (existingOrder) {
        return res.json({ 
          success: true,
          orderId: existingOrder._id.toString(),
          message: "Order already exists"
        });
      }

      const pendingOrder = await pendingOrderModel.findOne({ transactionId: transactionId });
      
      if (!pendingOrder) {
        return res.json({ 
          error: "Pending order not found. Payment may have expired." 
        });
      }

      // Tính lại giá gốc từ allProduct để đảm bảo đúng
      const calculatedBaseAmount = await calculateBaseAmountFromProducts(pendingOrder.allProduct);
      
      // Tính lại baseAmount
      let baseAmount = calculatedBaseAmount > 0 ? calculatedBaseAmount : pendingOrder.amount;
      // Nếu amount nhỏ hơn calculatedBaseAmount và có discount, có thể amount đã bị giảm
      if (pendingOrder.discountAmount > 0 && pendingOrder.amount < calculatedBaseAmount) {
        baseAmount = pendingOrder.amount + pendingOrder.discountAmount;
      }

      const discount = pendingOrder.discountAmount || 0;
      const finalAmount = Math.max(0, baseAmount - discount);

      const newOrder = new orderModel({
        allProduct: pendingOrder.allProduct,
        user: pendingOrder.user,
        amount: baseAmount, // Giá gốc
        transactionId: vnpTransactionNo,
        address: pendingOrder.address,
        phone: pendingOrder.phone,
        paymentMethod: "VNPAY",
        paymentStatus: "paid",
        vnp_TransactionNo: vnpTransactionNo,
        status: "Processing",
        voucherCode: pendingOrder.voucherCode || null,
        voucherId: pendingOrder.voucherId || null,
        discountAmount: discount,
        finalAmount: finalAmount,
      });

      // Giảm số lượng kho
      const stockResult = await reduceProductStock(pendingOrder.allProduct);
      if (!stockResult.success) {
        return res.json({ 
          error: stockResult.error || "Không đủ hàng trong kho" 
        });
      }

      const savedOrder = await newOrder.save();

      // Increment voucher usage if voucher was used
      if (pendingOrder.voucherId) {
        try {
          const voucher = await voucherModel.findById(pendingOrder.voucherId);
          if (voucher) {
            voucher.used = (voucher.used || 0) + 1;
            await voucher.save();
          }
        } catch (voucherErr) {
          console.log("Error incrementing voucher usage:", voucherErr);
        }
      }

      await pendingOrderModel.deleteOne({ transactionId: transactionId });

      return res.json({ 
        success: true,
        orderId: savedOrder._id.toString(),
        message: "Order created successfully"
      });
    } catch (error) {
      console.error("Error confirming payment from frontend:", error);
      return res.json({ 
        error: "Failed to create order: " + error.message 
      });
    }
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   * VNPay server gọi endpoint này để cập nhật trạng thái thanh toán
   */
  async vnpayIpn(req, res) {
    try {
      let vnp_Params = {};
      
      if (req.method === "POST") {
        if (req.body && Object.keys(req.body).length > 0) {
          vnp_Params = req.body;
        } else if (req.query && Object.keys(req.query).length > 0) {
          vnp_Params = req.query;
        }
      } else {
        vnp_Params = req.query;
      }
      
      if (!vnp_Params || Object.keys(vnp_Params).length === 0) {
        return res.status(200).json({ RspCode: "99", Message: "No parameters" });
      }
      
      const isValid = verifyReturnUrl({ ...vnp_Params });

      if (!isValid) {
        return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
      }

      const transactionId = vnp_Params["vnp_TxnRef"];
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const transactionNo = vnp_Params["vnp_TransactionNo"];

      const existingOrder = await orderModel.findOne({ 
        vnp_TransactionNo: transactionNo 
      });

      if (existingOrder) {
        return res.status(200).json({ RspCode: "00", Message: "Order already confirmed" });
      }

      if (responseCode === "00") {
        try {
          const pendingOrder = await pendingOrderModel.findOne({ transactionId: transactionId });
          
          if (!pendingOrder) {
            return res.status(200).json({ RspCode: "02", Message: "Order not found" });
          }

          // Tính lại giá gốc từ allProduct
          const calculatedBaseAmount = await calculateBaseAmountFromProducts(pendingOrder.allProduct);
          
          let baseAmount = calculatedBaseAmount > 0 ? calculatedBaseAmount : pendingOrder.amount;
          if (pendingOrder.discountAmount > 0 && pendingOrder.amount < calculatedBaseAmount) {
            baseAmount = pendingOrder.amount + pendingOrder.discountAmount;
          }

          const discount = pendingOrder.discountAmount || 0;
          const finalAmount = Math.max(0, baseAmount - discount);

          const newOrder = new orderModel({
            allProduct: pendingOrder.allProduct,
            user: pendingOrder.user,
            amount: baseAmount, // Giá gốc
            transactionId: transactionNo,
            address: pendingOrder.address,
            phone: pendingOrder.phone,
            paymentMethod: "VNPAY",
            paymentStatus: "paid",
            vnp_TransactionNo: transactionNo,
            status: "Processing",
            voucherCode: pendingOrder.voucherCode || null,
            voucherId: pendingOrder.voucherId || null,
            discountAmount: discount,
            finalAmount: finalAmount,
          });

          // Giảm số lượng kho
          const stockResult = await reduceProductStock(pendingOrder.allProduct);
          if (!stockResult.success) {
            return res.status(200).json({ 
              RspCode: "04", 
              Message: stockResult.error || "Không đủ hàng trong kho" 
            });
          }

          await newOrder.save();

          // Increment voucher usage if voucher was used
          if (pendingOrder.voucherId) {
            try {
              const voucher = await voucherModel.findById(pendingOrder.voucherId);
              if (voucher) {
                voucher.used = (voucher.used || 0) + 1;
                await voucher.save();
              }
            } catch (voucherErr) {
              console.log("Error incrementing voucher usage:", voucherErr);
            }
          }

          await pendingOrderModel.deleteOne({ transactionId: transactionId });

      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        } catch (error) {
          return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
        }
      } else {
        try {
          await pendingOrderModel.deleteOne({ transactionId: transactionId });
        } catch (error) {
        }
        
        return res.status(200).json({ RspCode: "00", Message: "Payment Failed" });
      }
    } catch (error) {
      return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  }
}

const vnpayController = new VNPayController();
module.exports = vnpayController;

