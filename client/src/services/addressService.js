import axios from "axios";

const API_BASE_URL = "https://provinces.open-api.vn/api";

/**
 * Lấy danh sách tất cả các tỉnh/thành phố
 */
export const getProvinces = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
};

/**
 * Lấy danh sách quận/huyện theo mã tỉnh/thành phố
 */
export const getDistricts = async (provinceCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts || [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};

/**
 * Lấy danh sách phường/xã theo mã quận/huyện
 */
export const getWards = async (districtCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
};

/**
 * Lấy thông tin chi tiết của một tỉnh/thành phố
 */
export const getProvinceByCode = async (code) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching province:", error);
    return null;
  }
};

/**
 * Lấy thông tin chi tiết của một quận/huyện
 */
export const getDistrictByCode = async (code) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/d/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching district:", error);
    return null;
  }
};

/**
 * Lấy thông tin chi tiết của một phường/xã
 */
export const getWardByCode = async (code) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/w/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ward:", error);
    return null;
  }
};

/**
 * Format địa chỉ đầy đủ từ các thông tin đã chọn
 */
export const formatFullAddress = (street, ward, district, province) => {
  const parts = [];
  if (street) parts.push(street);
  if (ward) parts.push(ward);
  if (district) parts.push(district);
  if (province) parts.push(province);
  return parts.join(", ");
};

