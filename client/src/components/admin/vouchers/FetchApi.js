import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

const BearerToken = () =>
  localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt")).token
    : false;

const Headers = () => {
  return {
    headers: {
      token: `Bearer ${BearerToken()}`,
    },
  };
};

export const getAllVouchers = async () => {
  try {
    let res = await axios.get(`${apiURL}/api/voucher/all-voucher`, Headers());
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const getVoucherById = async (vId) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/voucher/single-voucher`,
      { vId },
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const createVoucher = async (voucherData) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/voucher/add-voucher`,
      voucherData,
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const updateVoucher = async (voucherData) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/voucher/edit-voucher`,
      voucherData,
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const deleteVoucher = async (vId) => {
  try {
    let res = await axios.post(
      `${apiURL}/api/voucher/delete-voucher`,
      { vId },
      Headers()
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

export const validateVoucher = async (code, orderAmount) => {
  try {
    let res = await axios.post(`${apiURL}/api/voucher/validate`, {
      code,
      orderAmount,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.response?.data?.error || error.message };
  }
};

