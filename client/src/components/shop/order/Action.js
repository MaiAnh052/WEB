import { createOrder, createVNPayPayment } from "./FetchApi";

export const fetchData = async (cartListProduct, dispatch) => {
  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await cartListProduct();
    if (responseData && responseData.Products) {
      setTimeout(function () {
        dispatch({ type: "cartProduct", payload: responseData.Products });
        dispatch({ type: "loading", payload: false });
      }, 1000);
    }
  } catch (error) {
  }
};

export const pay = async (
  data,
  dispatch,
  state,
  setState,
  totalCost,
  history
) => {
  if (!state.address) {
    setState({ ...state, error: "Vui lòng nhập địa chỉ giao hàng" });
    return;
  } else if (!state.phone) {
    setState({ ...state, error: "Vui lòng nhập số điện thoại" });
    return;
  }

  const paymentMethod = state.paymentMethod || "COD";

  const safeParseArray = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const isBuyNow = localStorage.getItem("buyNowActive") === "1" && safeParseArray(localStorage.getItem("buyNowCart")).length > 0;
  const cart = isBuyNow
    ? safeParseArray(localStorage.getItem("buyNowCart"))
    : safeParseArray(localStorage.getItem("cart"));

  if (paymentMethod === "VNPAY") {
    dispatch({ type: "loading", payload: true });

    try {
      const userId = JSON.parse(localStorage.getItem("jwt")).user._id;
      const transactionId = Date.now().toString();

      // Tính baseAmount (giá gốc) trực tiếp từ cart
      let calculatedBaseAmount = 0;
      cart.forEach((cartItem) => {
        // Ưu tiên giá từ variant, nếu không có thì dùng giá từ cartItem
        const itemPrice = cartItem.variant?.price || cartItem.price || 0;
        calculatedBaseAmount += itemPrice * (cartItem.quantitiy || 1);
      });
      
      // Sử dụng baseAmount từ state nếu có và hợp lệ, nếu không thì dùng giá tính từ cart
      const baseAmount = (state.baseAmount && state.baseAmount > 0) ? state.baseAmount : calculatedBaseAmount;
      
      const tempOrderData = {
        allProduct: cart,
        user: userId,
        amount: baseAmount, // Giá gốc trước khi giảm voucher
        transactionId: transactionId,
        address: state.address,
        phone: state.phone,
        paymentMethod: "VNPAY",
        voucherCode: state.voucherCode || null,
        voucherId: state.voucherId || null,
        discountAmount: state.discountAmount || 0,
        finalAmount: state.finalAmount || (baseAmount - (state.discountAmount || 0)),
      };

      const paymentData = {
        orderId: transactionId,
        amount: state.finalAmount || (baseAmount - (state.discountAmount || 0)),
        orderDescription: `Thanh toan don hang ${transactionId}`,
        orderData: tempOrderData,
      };

      const vnpayResponse = await createVNPayPayment(paymentData);
      
      if (vnpayResponse.success && vnpayResponse.paymentUrl) {
        dispatch({ type: "loading", payload: false });
        window.location.replace(vnpayResponse.paymentUrl);
        return;
      } else {
        setState({ ...state, error: vnpayResponse.error || "Không thể tạo link thanh toán VNPay. Vui lòng thử lại." });
        dispatch({ type: "loading", payload: false });
        return;
      }
    } catch (error) {
      setState({ ...state, error: "Đã xảy ra lỗi khi tạo link thanh toán. Vui lòng thử lại." });
      dispatch({ type: "loading", payload: false });
      return;
    }
  } else {
    dispatch({ type: "loading", payload: true });
    
    // Tính baseAmount (giá gốc) trực tiếp từ cart, không phụ thuộc vào state
    let calculatedBaseAmount = 0;
    cart.forEach((cartItem) => {
      // Ưu tiên giá từ variant, nếu không có thì dùng giá từ cartItem
      const itemPrice = cartItem.variant?.price || cartItem.price || 0;
      calculatedBaseAmount += itemPrice * (cartItem.quantitiy || 1);
    });
    
    // Sử dụng baseAmount từ state nếu có và hợp lệ, nếu không thì dùng giá tính từ cart
    const baseAmount = (state.baseAmount && state.baseAmount > 0) ? state.baseAmount : calculatedBaseAmount;
    
    let orderData = {
      allProduct: cart,
      user: JSON.parse(localStorage.getItem("jwt")).user._id,
      amount: baseAmount, // Giá gốc trước khi giảm voucher
      transactionId: Date.now(),
      address: state.address,
      phone: state.phone,
      paymentMethod: "COD",
      voucherCode: state.voucherCode || null,
      voucherId: state.voucherId || null,
      discountAmount: state.discountAmount || 0,
    };

    try {
      let responseData = await createOrder(orderData);
      
      // Chỉ coi là lỗi khi có error HOẶC có message nhưng KHÔNG có success
      if (responseData.error || (responseData.message && !responseData.success && !responseData.Order)) {
        setState({ ...state, error: responseData.error || responseData.message });
        dispatch({ type: "loading", payload: false });
        return;
      }

      // Nếu thành công (có success hoặc Order)
      if (responseData.success || responseData.Order) {
        if (isBuyNow) {
          // Mua ngay: chỉ xóa buyNowCart, không ảnh hưởng giỏ hàng thật
          localStorage.removeItem("buyNowCart");
          localStorage.removeItem("buyNowActive");
          dispatch({ type: "orderSuccess", payload: true });
          dispatch({ type: "loading", payload: false });
        } else {
          // Checkout từ giỏ hàng: xóa giỏ hàng
          localStorage.setItem("cart", JSON.stringify([]));
          dispatch({ type: "cartProduct", payload: null });
          dispatch({ type: "cartTotalCost", payload: null });
          dispatch({ type: "orderSuccess", payload: true });
          dispatch({ type: "loading", payload: false });
        }
        
        // Redirect về trang đơn hàng của user
        return history.push("/user/orders");
      }
    } catch (error) {
      setState({ ...state, error: "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại." });
      dispatch({ type: "loading", payload: false });
    }
  }
};
