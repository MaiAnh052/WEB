import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticate } from "./fetchApi";

const safeParseArray = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const hasBuyNowCheckout = (location) => {
  const params = new URLSearchParams(location?.search || "");
  const buyNowInQuery = params.get("buyNow") === "1";
  const buyNowActive = localStorage.getItem("buyNowActive") === "1";
  const buyNowCart = safeParseArray(localStorage.getItem("buyNowCart"));
  return (buyNowInQuery || buyNowActive) && buyNowCart.length > 0;
};

const CartProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      (safeParseArray(localStorage.getItem("cart")).length !== 0 ||
        hasBuyNowCheckout(props.location)) &&
      isAuthenticate() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

export default CartProtectedRoute;
