import React, { createContext, useReducer } from "react";

const initialState = {
  products: [],
  loading: false,
};

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case "fetchProductsAndChangeState":
      return {
        ...state,
        products: action.payload,
        loading: false,
      };
    case "loading":
      return {
        ...state,
        loading: action.payload,
      };
    case "updateProductStock":
      const updatedProducts = state.products.map((product) => {
        if (product._id === action.productId) {
          return action.updatedProduct;
        }
        return product;
      });
      return {
        ...state,
        products: updatedProducts,
      };
    default:
      return state;
  }
};

export const InventoryContext = createContext();

export const InventoryContextProvider = ({ children }) => {
  const [data, dispatch] = useReducer(inventoryReducer, initialState);
  return (
    <InventoryContext.Provider value={{ data, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
};

