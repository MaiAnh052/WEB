import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getBrainTreeToken = async () => {
  let uId = JSON.parse(localStorage.getItem("jwt")).user._id;
  try {
    let res = await axios.post(`${apiURL}/api/braintree/get-token`, {
      uId: uId,
    });
    return res.data;
  } catch (error) {
  }
};

export const createOrder = async (orderData) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/create-order`, orderData);
    return res.data;
  } catch (error) {
    return { 
      error: error.response?.data?.message || error.response?.data?.error || "Không thể tạo đơn hàng" 
    };
  }
};

export const createVNPayPayment = async (orderData) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/vnpay/create-payment`, orderData);
    return res.data;
  } catch (error) {
    return { 
      error: error.response?.data?.error || error.message || "Không thể tạo link thanh toán VNPay" 
    };
  }
};

export const confirmVNPayPayment = async (paymentData) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/vnpay/confirm-payment`, paymentData);
    return res.data;
  } catch (error) {
    return { 
      error: error.response?.data?.error || error.message || "Không thể xác nhận thanh toán VNPay" 
    };
  }
};
