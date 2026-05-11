/**
 * Format number to VND currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatVND = (amount) => {
  if (!amount && amount !== 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number to VND without currency symbol (just number with dots)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatVNDNumber = (amount) => {
  if (!amount && amount !== 0) return "0";
  return new Intl.NumberFormat("vi-VN").format(amount);
};

