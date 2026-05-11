import React, { Fragment, useEffect, useContext, useState } from "react";
import OrderSuccessMessage from "./OrderSuccessMessage";
import { HomeContext } from "./";
import { sliderImages } from "../../admin/dashboardAdmin/Action";
import { prevSlide, nextSlide } from "./Mixins";

const apiURL = process.env.REACT_APP_API_URL;

const Slider = (props) => {
  const { data, dispatch } = useContext(HomeContext);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    sliderImages(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.sliderImages.length > 1) {
      const interval = setInterval(() => {
        setSlide((prev) => (prev + 1) % data.sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data.sliderImages.length]);

  const goToSlide = (index) => {
    setSlide(index);
  };

  return (
    <Fragment>
      <div
        style={{
          position: "relative",
          marginTop: "0",
          height: "600px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        {data.sliderImages.length > 0 ? (
          <>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                className="w-full h-full"
                src={`${apiURL}/uploads/customize/${data.sliderImages[slide].slideImage}`}
                alt="sliderImage"
                style={{
                  objectFit: "cover",
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a
                  href="#shop"
                  style={{
                    background: "#303031",
                    color: "#fff",
                    padding: "14px 40px",
                    fontSize: "18px",
                    fontWeight: 600,
                    borderRadius: "25px",
                    cursor: "pointer",
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1890ff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(24, 144, 255, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#303031";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                  }}
                >
                  Mua ngay
                </a>
              </div>
            </div>

            {data.sliderImages.length > 1 && (
              <>
                <button
                  onClick={() => prevSlide(data.sliderImages.length, slide, setSlide)}
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#262626" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => nextSlide(data.sliderImages.length, slide, setSlide)}
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 10,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "#262626" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "8px",
                    zIndex: 10,
                  }}
                >
                  {data.sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      style={{
                        width: slide === index ? "24px" : "12px",
                        height: "12px",
                        borderRadius: "6px",
                        border: "none",
                        background: slide === index ? "#fff" : "rgba(255, 255, 255, 0.5)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        if (slide !== index) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (slide !== index) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <div style={{ textAlign: "center", color: "white" }}>
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                Chào mừng đến với cửa hàng
              </h1>
              <p style={{ fontSize: "20px", marginBottom: "32px" }}>
                Khám phá những sản phẩm tuyệt vời
              </p>
              <a
                href="#shop"
                style={{
                  background: "#303031",
                  color: "#fff",
                  padding: "14px 40px",
                  fontSize: "18px",
                  fontWeight: 600,
                  borderRadius: "25px",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1890ff";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#303031";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Mua ngay
              </a>
            </div>
          </div>
        )}
      </div>
      <OrderSuccessMessage />
    </Fragment>
  );
};

export default Slider;
