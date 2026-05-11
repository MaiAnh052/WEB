export const cartList = () => {
  let carts = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : null;
  let list = [];
  if (carts !== null) {
    for (let cart of carts) {
      list.push(cart.id);
    }
    return list;
  } else {
    return (list = null);
  }
};

export const updateQuantity = (
  type,
  totalQuantitiy,
  quantitiy,
  setQuantitiy,
  setAlertq
) => {
  if (type === "increase") {
    if (quantitiy === totalQuantitiy) {
      setAlertq(true);
    } else {
      setQuantitiy(quantitiy + 1);
    }
  } else if (type === "decrease") {
    if (quantitiy === 1) {
      setQuantitiy(1);
      setAlertq(false);
    } else {
      setQuantitiy(quantitiy - 1);
    }
  }
};

export const slideImage = (type, active, count, setCount, pImages) => {
  // If clicking on a specific thumbnail
  if (active !== null && active !== undefined) {
    setCount(active);
    return;
  }
  
  // Navigation arrows
  if (type === "increase") {
    if (count === pImages.length - 1) {
      setCount(0);
    } else if (count < pImages.length) {
      setCount(count + 1);
    }
  } else if (type === "decrease") {
    if (count === 0) {
      setCount(pImages.length - 1);
    } else {
      setCount(count - 1);
    }
  }
};

export const inCart = (id) => {
  if (localStorage.getItem("cart")) {
    let cartProducts = JSON.parse(localStorage.getItem("cart"));
    for (let product of cartProducts) {
      if (product.id === id) {
        return true;
      }
    }
  }
  return false;
};

export const addToCart = (
  id,
  quantitiy,
  price,
  layoutDispatch,
  setQuantitiy,
  setAlertq,
  fetchData,
  totalCost,
  variant = null
) => {
  let isObj = false;
  let cart = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [];
  
  // Tạo unique key cho variant (nếu có)
  const cartItemKey = variant 
    ? `${id}_${variant.size}_${variant.color}` 
    : id;
  
  if (cart.length > 0) {
    cart.forEach((item) => {
      // Kiểm tra cùng sản phẩm và cùng variant
      const itemKey = item.variant 
        ? `${item.id}_${item.variant.size}_${item.variant.color}` 
        : item.id;
      if (itemKey === cartItemKey) {
        isObj = true;
      }
    });
    if (!isObj) {
      const cartItem = { id, quantitiy, price };
      if (variant) {
        cartItem.variant = {
          size: variant.size,
          color: variant.color,
          price: variant.price,
        };
      }
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  } else {
    const cartItem = { id, quantitiy, price };
    if (variant) {
      cartItem.variant = {
        size: variant.size,
        color: variant.color,
        price: variant.price,
      };
    }
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  layoutDispatch({ type: "inCart", payload: cartList() });
  layoutDispatch({ type: "cartTotalCost", payload: totalCost() });
  setQuantitiy(1);
  setAlertq(false);
  fetchData();
};
