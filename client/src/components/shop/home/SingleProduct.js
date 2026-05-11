
import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Card, Spin, Empty, Rate, Tag, Button } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { getAllProduct } from "../../admin/products/FetchApi";
import { HomeContext } from "./index";
import { isWishReq, unWishReq, isWish } from "./Mixins";
import { formatVND } from "../../../utils/formatCurrency";

const { Meta } = Card;
const apiURL = process.env.REACT_APP_API_URL;

const SingleProduct = (props) => {
  const { data, dispatch } = useContext(HomeContext);
  const { products } = data;
  const history = useHistory();

  const [wList, setWlist] = useState(
    JSON.parse(localStorage.getItem("wishList")) || []
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    try {
      let responseData = await getAllProduct();
      setTimeout(() => {
        if (responseData && responseData.Products) {
          dispatch({ type: "setProducts", payload: responseData.Products });
          dispatch({ type: "loading", payload: false });
        }
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  if (data.loading) {
    return (
      <div style={{ 
        gridColumn: "1 / -1", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        padding: "80px 0" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Fragment>
      {products && products.length > 0 ? (
        products.map((item, index) => {
          const isWishlisted = isWish(item._id, wList);
          const averageRating = item.pRatingsReviews.length > 0
            ? item.pRatingsReviews.reduce((sum, review) => sum + Number(review.rating), 0) / item.pRatingsReviews.length
            : 0;

          return (
            <Card
              key={index}
              hoverable
              style={{
                width: "100%",
                borderRadius: "1.5rem",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                transition: "all var(--transition-base)",
                marginBottom: "0",
                border: "1px solid var(--border-light)",
                background: "linear-gradient(135deg, #f9fafb 80%, #e0f2fe 100%)",
                fontFamily: "'Montserrat', 'Segoe UI', 'Roboto', sans-serif"
              }}
              bodyStyle={{
                padding: "20px 16px 16px 16px",
                borderRadius: "1.5rem",
              }}
              className="product-card"
              cover={
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "130%",
                    overflow: "hidden",
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    alt={item.pName}
                    src={`${apiURL}/uploads/products/${item.pImages[0]}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => history.push(`/products/${item._id}`)}
                  />
                  <Button
                    type="text"
                    icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isWishlisted) {
                        unWishReq(e, item._id, setWlist);
                      } else {
                        isWishReq(e, item._id, setWlist);
                      }
                    }}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isWishlisted ? "#ff4d4f" : "#8c8c8c",
                      fontSize: "18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                  {item.pOffer && item.pOffer !== "0" && (
                    <Tag
                      color="red"
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      -{item.pOffer}%
                    </Tag>
                  )}
                </div>
              }
              onClick={() => history.push(`/products/${item._id}`)}
            >
              <Meta
                title={
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#262626",
                      marginBottom: "8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: "48px",
                    }}
                  >
                    {item.pName}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <Rate
                        disabled
                        defaultValue={averageRating}
                        allowHalf
                        style={{ fontSize: "14px" }}
                      />
                      <span style={{ marginLeft: "8px", color: "#8c8c8c", fontSize: "12px" }}>
                        ({item.pRatingsReviews.length || 0})
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#1890ff",
                        marginTop: "8px",
                      }}
                    >
                      {item.pVariants && item.pVariants.length > 0 ? (
                        (() => {
                          const prices = item.pVariants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
                          if (prices.length === 0) {
                            return formatVND(item.pPrice || 0);
                          }
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          return minPrice === maxPrice 
                            ? formatVND(minPrice)
                            : `${formatVND(minPrice)} - ${formatVND(maxPrice)}`;
                        })()
                      ) : (
                        formatVND(item.pPrice || 0)
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                      <button
                        className="btn-buy-now"
                        onClick={e => {
                          e.stopPropagation();
                          // Chuyển hướng đến trang mua hàng hoặc thêm vào giỏ hàng
                          history.push(`/products/${item._id}`);
                        }}
                      >
                        Mua ngay
                      </button>
                      <button
                        className="btn-detail"
                        onClick={e => {
                          e.stopPropagation();
                          history.push(`/products/${item._id}`);
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                }
              />
            </Card>
          );
        })
      ) : (
        <div style={{ gridColumn: "1 / -1", padding: "80px 0" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: "#8c8c8c" }}>
                Không tìm thấy sản phẩm nào
              </span>
            }
          />
        </div>
      )}
    </Fragment>
  );
};

export default SingleProduct;