export const subTotal = (id, price, variant = null) => {
  let subTotalCost = 0;
  let carts = JSON.parse(localStorage.getItem("cart"));
  carts.forEach((item) => {
    if (item.id === id) {
      // Luôn dùng giá từ variant, không dùng giá mặc định
      const itemPrice = item.variant ? item.variant.price : (item.price || 0);
      subTotalCost = item.quantitiy * itemPrice;
    }
  });
  return subTotalCost;
};

export const quantity = (id) => {
  let product = 0;
  let carts = JSON.parse(localStorage.getItem("cart"));
  carts.forEach((item) => {
    if (item.id === id) {
      product = item.quantitiy;
    }
  });
  return product;
};

export const totalCost = () => {
  let totalCost = 0;
  let carts = JSON.parse(localStorage.getItem("cart"));
  carts.forEach((item) => {
    // Ưu tiên giá từ variant, nếu không có thì dùng giá từ item
    const itemPrice = item.variant ? item.variant.price : (item.price || 0);
    totalCost += item.quantitiy * itemPrice;
  });
  return totalCost;
};
