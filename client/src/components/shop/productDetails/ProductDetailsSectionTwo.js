import React, { Fragment, useContext, useEffect, useState } from "react";
import { Tabs, Card, Alert } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import AllReviews from "./AllReviews";
import ReviewForm from "./ReviewForm";

import { ProductDetailsContext } from "./";
import { LayoutContext } from "../layout";

import { isAuthenticate } from "../auth/fetchApi";

import "./style.css";

const { TabPane } = Tabs;

const ProductDetailsSectionTwo = (props) => {
  const { data, dispatch } = useContext(ProductDetailsContext);
  const { data: layoutData } = useContext(LayoutContext);
  const [singleProduct, setSingleproduct] = useState({});

  useEffect(() => {
    setSingleproduct(
      layoutData.singleProductDetail ? layoutData.singleProductDetail : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            defaultActiveKey="reviews"
            onChange={(key) => {
              dispatch({ type: "menu", payload: key === "description" });
            }}
            style={{ padding: "0 24px" }}
            size="large"
          >
            <TabPane
              tab={
                <span>
                  <MessageOutlined />
                  Đánh giá
                  {layoutData.singleProductDetail?.pRatingsReviews?.length > 0 && (
                    <span style={{ marginLeft: "8px", background: "#1890ff", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
                      {layoutData.singleProductDetail.pRatingsReviews.length}
                    </span>
                  )}
                </span>
              }
              key="reviews"
            >
              <div style={{ padding: "24px 0" }}>
                <AllReviews />
                {isAuthenticate() ? (
                  <ReviewForm />
                ) : (
                  <Alert
                    message="Vui lòng đăng nhập để đánh giá sản phẩm"
                    type="info"
                    showIcon
                    style={{ marginTop: "24px" }}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </section>

      {/* Category Footer */}
      <div style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0", marginTop: "32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
          <div style={{ textAlign: "center", color: "#8c8c8c" }}>
            <span style={{ fontWeight: 500, marginRight: "8px" }}>Danh mục:</span>
            <span style={{ color: "#262626", fontWeight: 500 }}>
              {singleProduct.pCategory ? singleProduct.pCategory.cName : ""}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductDetailsSectionTwo;
