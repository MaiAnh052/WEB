import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Row, Col, Spin, Empty, Button, InputNumber, Rate, Tag, Space, Card, message } from "antd";
import { HeartOutlined, HeartFilled, LeftOutlined, RightOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ProductDetailsContext } from "./index";
import { LayoutContext } from "../layout";
import Submenu from "./Submenu";
import ProductDetailsSectionTwo from "./ProductDetailsSectionTwo";

import { getSingleProduct } from "./FetchApi";
import { cartListProduct } from "../partials/FetchApi";

import { isWishReq, unWishReq, isWish } from "../home/Mixins";
import { slideImage, addToCart, cartList } from "./Mixins";
import { totalCost } from "../partials/Mixins";
import { formatVND } from "../../../utils/formatCurrency";

const apiURL = process.env.REACT_APP_API_URL;

const ProductDetailsSection = (props) => {
  let { id } = useParams();
  const history = useHistory();

  const { data, dispatch } = useContext(ProductDetailsContext);
  const { data: layoutData, dispatch: layoutDispatch } = useContext(LayoutContext);

  const sProduct = layoutData.singleProductDetail;
  const [pImages, setPimages] = useState(null);
  const [count, setCount] = useState(0);
  const [quantitiy, setQuantitiy] = useState(1);
  const [, setAlertq] = useState(false);
  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList")) || []
  );
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getSingleProduct(id);
      setTimeout(() => {
        if (responseData.Product) {
          layoutDispatch({
            type: "singleProductDetail",
            payload: responseData.Product,
          });
          setPimages(responseData.Product.pImages);
          setCount(0);
          dispatch({ type: "loading", payload: false });
          layoutDispatch({ type: "inCart", payload: cartList() });
        }
        if (responseData.error) {
          console.log(responseData.error);
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
    fetchCartProduct();
  };

  const fetchCartProduct = async () => {
    try {
      let responseData = await cartListProduct();
      if (responseData && responseData.Products) {
        layoutDispatch({ type: "cartProduct", payload: responseData.Products });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = () => {
    // Nếu có variants thì BẮT BUỘC phải chọn variant
    if (sProduct.pVariants && sProduct.pVariants.length > 0 && !selectedVariant) {
      message.warning("Vui lòng chọn size và màu sắc để xem giá và thêm vào giỏ hàng");
      return;
    }
    
    // Nếu không có variant và không có giá mặc định
    if ((!sProduct.pVariants || sProduct.pVariants.length === 0) && !sProduct.pPrice) {
      message.warning("Sản phẩm chưa có giá. Vui lòng liên hệ cửa hàng.");
      return;
    }
    
    // Kiểm tra số lượng
    const availableQuantity = selectedVariant 
      ? selectedVariant.quantity 
      : sProduct.pQuantity;
    
    if (availableQuantity === 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }
    
    // Giá phải từ variant hoặc giá mặc định (nếu không có variant)
    const price = selectedVariant 
      ? selectedVariant.price 
      : (sProduct.pPrice || 0);
    
    if (!price || price === 0) {
      message.warning("Sản phẩm chưa có giá. Vui lòng chọn size và màu sắc.");
      return;
    }
    
    addToCart(
      sProduct._id,
      quantitiy,
      price,
      layoutDispatch,
      setQuantitiy,
      setAlertq,
      fetchData,
      totalCost,
      selectedVariant
    );
    message.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    // Nếu có variants thì BẮT BUỘC phải chọn variant
    if (sProduct.pVariants && sProduct.pVariants.length > 0 && !selectedVariant) {
      message.warning("Vui lòng chọn size và màu sắc để thanh toán");
      return;
    }

    // Nếu không có variant và không có giá mặc định
    if ((!sProduct.pVariants || sProduct.pVariants.length === 0) && !sProduct.pPrice) {
      message.warning("Sản phẩm chưa có giá. Vui lòng liên hệ cửa hàng.");
      return;
    }

    const availableQuantity = selectedVariant ? selectedVariant.quantity : sProduct.pQuantity;
    if (availableQuantity === 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    const price = selectedVariant ? selectedVariant.price : (sProduct.pPrice || 0);
    if (!price || price === 0) {
      message.warning("Sản phẩm chưa có giá. Vui lòng chọn size và màu sắc.");
      return;
    }

    const buyNowItem = {
      id: sProduct._id,
      quantitiy: quantitiy,
      price: price,
    };

    if (selectedVariant) {
      buyNowItem.variant = {
        size: selectedVariant.size,
        color: selectedVariant.color,
        price: selectedVariant.price,
      };
    }

    localStorage.setItem("buyNowCart", JSON.stringify([buyNowItem]));
    localStorage.setItem("buyNowActive", "1");
    history.push("/checkout?buyNow=1");
  };

  if (data.loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!sProduct) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "#262626" }}>
                Không tìm thấy sản phẩm
              </h2>
              <p style={{ color: "#8c8c8c", marginBottom: "24px" }}>
                Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.
              </p>
              <Button type="primary" icon={<LeftOutlined />} onClick={() => window.history.back()}>
                Quay lại
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const isWishlisted = isWish(sProduct._id, wList);
  const averageRating = sProduct.pRatingsReviews.length > 0
    ? sProduct.pRatingsReviews.reduce((sum, review) => sum + Number(review.rating), 0) / sProduct.pRatingsReviews.length
    : 0;
  const isInCart = layoutData.inCart !== null && layoutData.inCart.includes(sProduct._id);

  return (
    <Fragment>
      <Submenu
        value={{
          categoryId: sProduct.pCategory?._id || "",
          product: sProduct.pName,
          category: sProduct.pCategory?.cName || "",
        }}
      />
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <Row gutter={[32, 32]}>
          {/* Image Gallery */}
          <Col xs={24} lg={12}>
            <Card
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Thumbnail Images */}
              {pImages && pImages.length > 1 && (
                <div style={{ padding: "16px", display: "flex", gap: "12px", overflowX: "auto" }}>
                  {pImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setCount(index)}
                      style={{
                        flexShrink: 0,
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: count === index ? "2px solid #1890ff" : "2px solid #f0f0f0",
                        cursor: "pointer",
                        opacity: count === index ? 1 : 0.7,
                        transition: "all 0.3s",
                      }}
                    >
                      <img
                        src={`${apiURL}/uploads/products/${img}`}
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div style={{ position: "relative", paddingTop: "100%", background: "#f5f5f5" }}>
                <img
                  src={`${apiURL}/uploads/products/${sProduct.pImages[count]}`}
                  alt={sProduct.pName}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {pImages && pImages.length > 1 && (
                  <>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<LeftOutlined />}
                      onClick={() => slideImage("decrease", null, count, setCount, pImages)}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<RightOutlined />}
                      onClick={() => slideImage("increase", null, count, setCount, pImages)}
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {count + 1} / {pImages.length}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Col>

          {/* Product Info */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Title */}
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#262626", marginBottom: "16px" }}>
                  {sProduct.pName}
                </h1>
                <Space size="middle" align="center">
                  <Rate disabled defaultValue={averageRating} allowHalf style={{ fontSize: "16px" }} />
                  <span style={{ color: "#8c8c8c" }}>
                    ({sProduct.pRatingsReviews.length || 0} đánh giá)
                  </span>
                </Space>
              </div>

              {/* Price - Chỉ hiển thị khi đã chọn variant */}
              <div>
                {selectedVariant ? (
                  <Space size="large" align="baseline">
                    <span style={{ fontSize: "32px", fontWeight: "bold", color: "#1890ff" }}>
                      {formatVND(selectedVariant.price)}
                    </span>
                    {sProduct.pOffer && sProduct.pOffer !== "0" && (
                      <>
                        <span style={{ fontSize: "18px", color: "#8c8c8c", textDecoration: "line-through" }}>
                          {formatVND(selectedVariant.price * (1 + parseFloat(sProduct.pOffer) / 100))}
                        </span>
                        <Tag color="red" style={{ fontSize: "14px", padding: "4px 12px" }}>
                          -{sProduct.pOffer}%
                        </Tag>
                      </>
                    )}
                  </Space>
                ) : sProduct.pVariants && sProduct.pVariants.length > 0 ? (
                  <div>
                    <div style={{ fontSize: "14px", color: "#8c8c8c", marginBottom: "8px" }}>
                      Vui lòng chọn size và màu để xem giá
                    </div>
                    <div style={{ fontSize: "16px", color: "#595959" }}>
                      Giá từ: {formatVND(Math.min(...sProduct.pVariants.map(v => parseFloat(v.price) || 0).filter(p => p > 0)))} 
                      {" - "}
                      {formatVND(Math.max(...sProduct.pVariants.map(v => parseFloat(v.price) || 0).filter(p => p > 0)))}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: "32px", fontWeight: "bold", color: "#1890ff" }}>
                    {formatVND(sProduct.pPrice || 0)}
                  </span>
                )}
              </div>

              {/* Variants Selection - Bắt buộc nếu có variants */}
              {sProduct.pVariants && sProduct.pVariants.length > 0 && (
                <Card style={{ borderRadius: "8px" }} bodyStyle={{ padding: "16px" }}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <div style={{ fontSize: "14px", color: "#ff4d4f", fontWeight: 500 }}>
                      * Vui lòng chọn size và màu để xem giá và thêm vào giỏ hàng
                    </div>
                    {/* Size Selection */}
                    <div>
                      <div style={{ marginBottom: "8px", fontWeight: 500, color: "#262626" }}>
                        Size: {selectedVariant ? selectedVariant.size : "Chưa chọn"} *
                      </div>
                      <Space wrap>
                        {[...new Set(sProduct.pVariants.map(v => v.size))].map((size) => {
                          const sizeVariants = sProduct.pVariants.filter(v => v.size === size);
                          const hasStock = sizeVariants.some(v => v.quantity > 0);
                          return (
                            <Button
                              key={size}
                              type={selectedVariant?.size === size ? "primary" : "default"}
                              disabled={!hasStock}
                              onClick={() => {
                                // Nếu đã chọn size này, giữ nguyên color nếu có
                                if (selectedVariant?.size === size) {
                                  return;
                                }
                                // Chọn variant đầu tiên có size này và còn hàng
                                const availableVariant = sizeVariants.find(v => v.quantity > 0) || sizeVariants[0];
                                setSelectedVariant(availableVariant);
                              }}
                              style={{
                                minWidth: "60px",
                                borderColor: selectedVariant?.size === size ? "#1890ff" : undefined,
                              }}
                            >
                              {size}
                            </Button>
                          );
                        })}
                      </Space>
                    </div>

                    {/* Color Selection */}
                    {selectedVariant && (
                      <div>
                        <div style={{ marginBottom: "8px", fontWeight: 500, color: "#262626" }}>
                          Màu sắc: {selectedVariant.color}
                        </div>
                        <Space wrap>
                          {sProduct.pVariants
                            .filter(v => v.size === selectedVariant.size)
                            .map((variant) => (
                              <Button
                                key={`${variant.size}-${variant.color}`}
                                type={selectedVariant.color === variant.color ? "primary" : "default"}
                                disabled={variant.quantity === 0}
                                onClick={() => setSelectedVariant(variant)}
                                style={{
                                  minWidth: "80px",
                                  borderColor: selectedVariant.color === variant.color ? "#1890ff" : undefined,
                                }}
                              >
                                {variant.color}
                                {variant.quantity === 0 && " (Hết)"}
                              </Button>
                            ))}
                        </Space>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {/* Wishlist Button */}
              <Button
                type="text"
                icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                onClick={(e) => {
                  if (isWishlisted) {
                    unWishReq(e, sProduct._id, setWlist);
                  } else {
                    isWishReq(e, sProduct._id, setWlist);
                  }
                }}
                style={{
                  color: isWishlisted ? "#ff4d4f" : "#8c8c8c",
                  width: "fit-content",
                }}
              >
                {isWishlisted ? "Đã yêu thích" : "Thêm vào yêu thích"}
              </Button>

              {/* Description */}
              <Card
                title="Mô tả sản phẩm"
                style={{ borderRadius: "8px" }}
                bodyStyle={{ padding: "16px" }}
              >
                <p style={{ color: "#595959", lineHeight: "1.8", whiteSpace: "pre-line" }}>
                  {sProduct.pDescription}
                </p>
              </Card>

              {/* Quantity & Add to Cart */}
              <Card style={{ borderRadius: "8px" }} bodyStyle={{ padding: "16px" }}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 500, color: "#262626" }}>Số lượng</span>
                    {(() => {
                      const availableQty = selectedVariant ? selectedVariant.quantity : sProduct.pQuantity;
                      return availableQty > 0 ? (
                        <Tag color="green">Còn {availableQty} sản phẩm</Tag>
                      ) : (
                        <Tag color="red">Hết hàng</Tag>
                      );
                    })()}
                  </div>

                  {(() => {
                    const availableQty = selectedVariant ? selectedVariant.quantity : sProduct.pQuantity;
                    return availableQty > 0 && (
                      <InputNumber
                        min={1}
                        max={availableQty}
                        value={quantitiy}
                        onChange={(value) => {
                          if (value >= 1 && value <= availableQty) {
                            setQuantitiy(value);
                          }
                        }}
                        style={{ width: "100%" }}
                        size="large"
                      />
                    );
                  })()}

                  {(() => {
                    const availableQty = selectedVariant ? selectedVariant.quantity : sProduct.pQuantity;
                    return availableQty > 0 ? (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {isInCart ? (
                          <Button
                            disabled
                            size="large"
                            style={{ flex: 1, height: "48px" }}
                          >
                            Đã có trong giỏ hàng
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="primary"
                              size="large"
                              icon={<ShoppingCartOutlined />}
                              onClick={handleAddToCart}
                              style={{ flex: 1, height: "48px", fontSize: "16px" }}
                            >
                              Thêm vào giỏ hàng
                            </Button>
                            <Button
                              type="default"
                              size="large"
                              style={{ flex: 1, height: "48px", fontSize: "16px", background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)', color: '#fff', border: 'none', fontWeight: 600 }}
                              onClick={handleBuyNow}
                            >
                              Mua ngay
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <Button
                        disabled
                        size="large"
                        style={{ width: "100%", height: "48px" }}
                      >
                        Hết hàng
                      </Button>
                    );
                  })()}
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </section>

      <ProductDetailsSectionTwo />
    </Fragment>
  );
};

export default ProductDetailsSection;
