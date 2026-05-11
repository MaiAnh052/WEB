import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getAllProductWithStock = async () => {
  try {
    let res = await axios.get(`${apiURL}/api/product/all-product-with-stock`);
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: "Failed to fetch products" };
  }
};

export const updateStock = async ({ pId, quantity, variantIndex, variantQuantity }) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/update-stock`, {
      pId,
      quantity,
      variantIndex,
      variantQuantity,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: error.response?.data?.error || "Failed to update stock" };
  }
};

