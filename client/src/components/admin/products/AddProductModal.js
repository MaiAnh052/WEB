import React, { Fragment, useContext, useState, useEffect } from "react";
import { ProductContext } from "./index";
import { createProduct, getAllProduct } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";

const AddProductDetail = ({ categories }) => {
  const { data, dispatch } = useContext(ProductContext);

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );

  const [fData, setFdata] = useState({
    pName: "",
    pDescription: "",
    pStatus: "Active",
    pImage: null,
    pCategory: "",
    pOffer: 0,
    pQuantity: "",
    pVariants: [{ size: "", color: "", price: "", quantity: 0 }], // Luôn có ít nhất 1 biến thể
    success: false,
    error: false,
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview && preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    let responseData = await getAllProduct();
    setTimeout(() => {
      if (responseData && responseData.Products) {
        dispatch({
          type: "fetchProductsAndChangeState",
          payload: responseData.Products,
        });
      }
    }, 1000);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + idx + Math.random(),
    }));

    setImagePreviews((prev) => {
      const updated = [...prev, ...newPreviews];
      return updated;
    });

    setFdata((prevData) => {
      const currentImages = prevData.pImage || [];
      const updatedImages = [...currentImages, ...files];
      return {
        ...prevData,
        error: false,
        success: false,
        pImage: updatedImages,
      };
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = fData.pImage.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index].preview);
    setImagePreviews(newPreviews);
    setFdata({
      ...fData,
      pImage: newFiles,
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!fData.pImage || fData.pImage.length === 0) {
      setFdata({ ...fData, error: "Vui lòng tải lên ít nhất 1 ảnh" });
      setTimeout(() => {
        setFdata({ ...fData, error: false });
      }, 2000);
      return;
    }

    try {
      let responseData = await createProduct({
        ...fData,
        pVariants: fData.pVariants.filter(
          (v) => v.size && v.color && v.price && v.quantity !== undefined
        ),
      });
      if (responseData.success) {
        fetchData();
        imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
        setImagePreviews([]);
        setFdata({
          pName: "",
          pDescription: "",
          pStatus: "Active",
          pImage: null,
          pCategory: "",
          pOffer: 0,
          pQuantity: "",
          pVariants: [{ size: "", color: "", price: "", quantity: 0 }],
          success: responseData.success,
          error: false,
        });
        e.target.reset();
        setTimeout(() => {
          dispatch({ type: "addProductModal", payload: false });
        }, 500);
      } else if (responseData.error) {
        setFdata({ ...fData, success: false, error: responseData.error });
        setTimeout(() => {
          return setFdata({ ...fData, error: false, success: false });
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
        onClick={(e) => {
          imagePreviews.forEach((preview) => {
            if (preview && preview.preview) {
              URL.revokeObjectURL(preview.preview);
            }
          });
          setImagePreviews([]);
          dispatch({ type: "addProductModal", payload: false });
        }}
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />
      {/* End Black Overlay */}

      {/* Modal Start */}
      <div
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed inset-0 z-30 overflow-y-auto p-4`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="relative bg-white w-full max-w-7xl shadow-lg flex flex-col space-y-4 px-6 py-6 mx-auto my-4">
          <div className="flex items-center justify-between w-full pt-2 sticky top-0 bg-white z-50 pb-2 border-b -mx-6 -mt-6 px-6 pt-6">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Add Product
            </span>
            {/* Close Modal */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                imagePreviews.forEach((preview) => {
                  if (preview && preview.preview) {
                    URL.revokeObjectURL(preview.preview);
                  }
                });
                setImagePreviews([]);
                dispatch({ type: "addProductModal", payload: false });
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
          {fData.error ? alert(fData.error, "red") : ""}
          {fData.success ? alert(fData.success, "green") : ""}
          <form className="w-full" onSubmit={(e) => submitForm(e)}>
            {/* Grid Layout - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Product Name */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    value={fData.pName}
                    onChange={(e) =>
                      setFdata({
                        ...fData,
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
                      value={fData.pStatus}
                      onChange={(e) =>
                        setFdata({
                          ...fData,
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
                      value={fData.pCategory}
                      onChange={(e) =>
                        setFdata({
                          ...fData,
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
                      {categories.length > 0
                        ? categories.map(function (elem) {
                            return (
                              <option name="category" value={elem._id} key={elem._id}>
                                {elem.cName}
                              </option>
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
                      value={fData.pVariants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0) || fData.pQuantity}
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
                      value={fData.pOffer}
                      onChange={(e) =>
                        setFdata({
                          ...fData,
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
                    value={fData.pDescription}
                    onChange={(e) =>
                      setFdata({
                        ...fData,
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
                {/* Image Upload Section */}
                <div className="flex flex-col">
                  <label htmlFor="image">Product Images *</label>
                  <span className="text-gray-600 text-xs mb-2">
                    Có thể tải lên nhiều ảnh (tối thiểu 1 ảnh)
                  </span>
                  
                  {/* Image Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Đã chọn {imagePreviews.length} ảnh
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={preview.id || `preview-${index}`}
                            className="relative group"
                            style={{
                              paddingTop: "100%",
                              position: "relative",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: "2px solid #e5e7eb",
                            }}
                          >
                            <img
                              src={preview.preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                fontSize: "14px",
                                lineHeight: "1",
                              }}
                            >
                              ×
                            </button>
                            <div
                              className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded"
                            >
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    onChange={handleImageChange}
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
                    {fData.pVariants.map((variant, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-white"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-sm font-medium text-gray-700">
                            Biến thể #{index + 1}
                          </span>
                          {fData.pVariants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = fData.pVariants.filter(
                                  (_, i) => i !== index
                                );
                                setFdata({ ...fData, pVariants: newVariants });
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
                                const newVariants = [...fData.pVariants];
                                newVariants[index].size = e.target.value;
                                setFdata({ ...fData, pVariants: newVariants });
                              }}
                              placeholder="Nhập Loại vd S, M, L, Cấu hình"
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
                                const newVariants = [...fData.pVariants];
                                newVariants[index].color = e.target.value;
                                setFdata({ ...fData, pVariants: newVariants });
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
                                const newVariants = [...fData.pVariants];
                                newVariants[index].price = e.target.value;
                                setFdata({ ...fData, pVariants: newVariants });
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
                                const newVariants = [...fData.pVariants];
                                newVariants[index].quantity = parseInt(e.target.value) || 0;
                                setFdata({ ...fData, pVariants: newVariants });
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
                      setFdata({
                        ...fData,
                        pVariants: [
                          ...fData.pVariants,
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
                Create product
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

const AddProductModal = (props) => {
  useEffect(() => {
    fetchCategoryData();
  }, []);

  const [allCat, setAllCat] = useState({});

  const fetchCategoryData = async () => {
    let responseData = await getAllCategory();
    if (responseData.Categories) {
      setAllCat(responseData.Categories);
    }
  };

  return (
    <Fragment>
      <AddProductDetail categories={allCat} />
    </Fragment>
  );
};

export default AddProductModal;
