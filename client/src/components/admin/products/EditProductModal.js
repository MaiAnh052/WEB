import React, { Fragment, useContext, useState, useEffect } from "react";
import { ProductContext } from "./index";
import { editProduct, getAllProduct } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";
const apiURL = process.env.REACT_APP_API_URL;

const EditProductModal = (props) => {
  const { data, dispatch } = useContext(ProductContext);

  const [categories, setCategories] = useState(null);

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );

  const [editformData, setEditformdata] = useState({
    pId: "",
    pName: "",
    pDescription: "",
    pImages: null,
    pEditImages: null,
    pStatus: "",
    pCategory: "",
    pQuantity: "",
    pPrice: "",
    pOffer: "",
    pVariants: [],
    error: false,
    success: false,
  });

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    let responseData = await getAllCategory();
    if (responseData.Categories) {
      setCategories(responseData.Categories);
    }
  };

  useEffect(() => {
    setEditformdata({
      pId: data.editProductModal.pId,
      pName: data.editProductModal.pName,
      pDescription: data.editProductModal.pDescription,
      pImages: data.editProductModal.pImages,
      pStatus: data.editProductModal.pStatus,
      pCategory: data.editProductModal.pCategory,
      pQuantity: data.editProductModal.pQuantity,
      pPrice: data.editProductModal.pPrice,
      pOffer: data.editProductModal.pOffer,
      pVariants: data.editProductModal.pVariants && data.editProductModal.pVariants.length > 0 
        ? data.editProductModal.pVariants 
        : [{ size: "", color: "", price: "", quantity: 0 }],
    });
  }, [data.editProductModal]);

  const fetchData = async () => {
    let responseData = await getAllProduct();
    if (responseData && responseData.Products) {
      dispatch({
        type: "fetchProductsAndChangeState",
        payload: responseData.Products,
      });
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!editformData.pEditImages) {
      console.log("Image Not upload=============", editformData);
    } else {
      console.log("Image uploading");
    }
    try {
      let responseData = await editProduct(editformData);
      if (responseData.success) {
        fetchData();
        setEditformdata({ ...editformData, success: responseData.success });
        setTimeout(() => {
          return setEditformdata({
            ...editformData,
            success: responseData.success,
          });
        }, 2000);
      } else if (responseData.error) {
        setEditformdata({ ...editformData, error: responseData.error });
        setTimeout(() => {
          return setEditformdata({
            ...editformData,
            error: responseData.error,
          });
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      {/* Black Overlay */}
      <div
        onClick={(e) =>
          dispatch({ type: "editProductModalClose", payload: false })
        }
        className={`${
          data.editProductModal.modal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />
      {/* End Black Overlay */}

      {/* Modal Start */}
      <div
        className={`${
          data.editProductModal.modal ? "" : "hidden"
        } fixed inset-0 z-30 overflow-y-auto p-4`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="relative bg-white w-full max-w-7xl shadow-lg flex flex-col space-y-4 px-6 py-6 mx-auto my-4">
          <div className="flex items-center justify-between w-full pt-2 sticky top-0 bg-white z-50 pb-2 border-b -mx-6 -mt-6 px-6 pt-6">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Edit Product
            </span>
            {/* Close Modal */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "editProductModalClose", payload: false });
              }}
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              style={{ minWidth: "36px", minHeight: "36px" }}
              title="Đóng"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {editformData.error ? alert(editformData.error, "red") : ""}
          {editformData.success ? alert(editformData.success, "green") : ""}
          <form className="w-full" onSubmit={(e) => submitForm(e)}>
            {/* Grid Layout - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    value={editformData.pName}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pName: e.target.value,
                      })
                    }
                    className="px-4 py-2 border focus:outline-none rounded"
                    type="text"
                  />
                </div>

                {/* Status and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="status">Product Status *</label>
                    <select
                      value={editformData.pStatus}
                      onChange={(e) =>
                        setEditformdata({
                          ...editformData,
                          error: false,
                          success: false,
                          pStatus: e.target.value,
                        })
                      }
                      name="status"
                      className="px-4 py-2 border focus:outline-none rounded"
                      id="status"
                    >
                      <option name="status" value="Active">
                        Active
                      </option>
                      <option name="status" value="Disabled">
                        Disabled
                      </option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="category">Product Category *</label>
                    <select
                      onChange={(e) =>
                        setEditformdata({
                          ...editformData,
                          error: false,
                          success: false,
                          pCategory: e.target.value,
                        })
                      }
                      name="category"
                      className="px-4 py-2 border focus:outline-none rounded"
                      id="category"
                    >
                      <option disabled value="">
                        Select a category
                      </option>
                      {categories && categories.length > 0
                        ? categories.map((elem) => {
                            return (
                              <Fragment key={elem._id}>
                                {editformData.pCategory._id &&
                                editformData.pCategory._id === elem._id ? (
                                  <option
                                    name="category"
                                    value={elem._id}
                                    key={elem._id}
                                    selected
                                  >
                                    {elem.cName}
                                  </option>
                                ) : (
                                  <option
                                    name="category"
                                    value={elem._id}
                                    key={elem._id}
                                  >
                                    {elem.cName}
                                  </option>
                                )}
                              </Fragment>
                            );
                          })
                        : ""}
                    </select>
                  </div>
                </div>

                {/* Quantity and Offer Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="quantity" className="text-sm">Tổng số lượng *</label>
                    <input
                      value={editformData.pVariants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0) || editformData.pQuantity}
                      disabled
                      type="number"
                      className="px-4 py-2 border focus:outline-none rounded bg-gray-100 text-sm"
                      id="quantity"
                    />
                    <span className="text-xs text-gray-500">Tự động tính từ biến thể</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="offer">Product Offer (%) *</label>
                    <input
                      value={editformData.pOffer}
                      onChange={(e) =>
                        setEditformdata({
                          ...editformData,
                          error: false,
                          success: false,
                          pOffer: e.target.value,
                        })
                      }
                      type="number"
                      className="px-4 py-2 border focus:outline-none rounded"
                      id="offer"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="description">Product Description *</label>
                  <textarea
                    value={editformData.pDescription}
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pDescription: e.target.value,
                      })
                    }
                    className="px-4 py-2 border focus:outline-none rounded"
                    name="description"
                    id="description"
                    rows={4}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Product Images */}
                <div className="flex flex-col">
                  <label htmlFor="image">Product Images *</label>
                  {editformData.pImages && editformData.pImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {editformData.pImages.map((image, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            paddingTop: "100%",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "2px solid #e5e7eb",
                          }}
                        >
                          <img
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            src={`${apiURL}/uploads/products/${image}`}
                            alt={`productImage ${index + 1}`}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "4px",
                              left: "4px",
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                  <span className="text-gray-600 text-xs mb-2 block">
                    Hiện có {editformData.pImages ? editformData.pImages.length : 0} ảnh. Có thể thêm ảnh mới hoặc giữ nguyên ảnh hiện tại.
                  </span>
                  <input
                    onChange={(e) =>
                      setEditformdata({
                        ...editformData,
                        error: false,
                        success: false,
                        pEditImages: [...e.target.files],
                      })
                    }
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    className="px-4 py-2 border focus:outline-none rounded"
                    id="image"
                    multiple
                  />
                </div>

                {/* Product Variants Section - Compact, nằm dưới Images */}
                <div className="flex flex-col space-y-3">
                  <label className="text-base font-semibold text-gray-700">Biến thể sản phẩm (Size & Màu) *</label>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {editformData.pVariants.map((variant, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-white"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-sm font-medium text-gray-700">
                            Biến thể #{index + 1}
                          </span>
                          {editformData.pVariants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = editformData.pVariants.filter(
                                  (_, i) => i !== index
                                );
                                setEditformdata({ ...editformData, pVariants: newVariants });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm text-gray-700">
                              Size *
                            </label>
                            <input
                              type="text"
                              value={variant.size}
                              onChange={(e) => {
                                const newVariants = [...editformData.pVariants];
                                newVariants[index].size = e.target.value;
                                setEditformdata({ ...editformData, pVariants: newVariants });
                              }}
                              placeholder="S, M, L"
                              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm text-gray-700">
                              Màu *
                            </label>
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) => {
                                const newVariants = [...editformData.pVariants];
                                newVariants[index].color = e.target.value;
                                setEditformdata({ ...editformData, pVariants: newVariants });
                              }}
                              placeholder="Đỏ, Xanh"
                              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm text-gray-700">
                              Giá *
                            </label>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => {
                                const newVariants = [...editformData.pVariants];
                                newVariants[index].price = e.target.value;
                                setEditformdata({ ...editformData, pVariants: newVariants });
                              }}
                              placeholder="0"
                              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm text-gray-700">
                              SL *
                            </label>
                            <input
                              type="number"
                              value={variant.quantity}
                              onChange={(e) => {
                                const newVariants = [...editformData.pVariants];
                                newVariants[index].quantity = parseInt(e.target.value) || 0;
                                setEditformdata({ ...editformData, pVariants: newVariants });
                              }}
                              placeholder="0"
                              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Nút thêm biến thể */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditformdata({
                        ...editformData,
                        pVariants: [
                          ...editformData.pVariants,
                          { size: "", color: "", price: "", quantity: 0 },
                        ],
                      });
                    }}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    + Thêm biến thể
                  </button>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex flex-col space-y-1 w-full pb-4 mt-4 border-t pt-4">
              <button
                style={{ background: "#303031" }}
                type="submit"
                className="rounded-full bg-gray-800 text-gray-100 text-lg font-medium py-2 w-full"
              >
                Update product
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default EditProductModal;
