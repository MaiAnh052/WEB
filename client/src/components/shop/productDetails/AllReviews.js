import React, { Fragment, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Rate, Button, Empty, message, Space, Typography } from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { LayoutContext } from "../layout";
import { deleteReview } from "./Action";
import { isAuthenticate } from "../auth/fetchApi";
import { getSingleProduct } from "./FetchApi";

const { Text, Paragraph } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

const AllReviews = (props) => {
  const { data, dispatch } = useContext(LayoutContext);
  const { pRatingsReviews } = data.singleProductDetail;
  let { id } = useParams();

  const [fData, setFdata] = useState({
    success: false,
  });

  if (fData.success) {
    setTimeout(() => {
      setFdata({ ...fData, success: false });
    }, 2000);
  }

  const fetchData = async () => {
    try {
      let responseData = await getSingleProduct(id);
      if (responseData.Product) {
        dispatch({
          type: "singleProductDetail",
          payload: responseData.Product,
        });
      }
      if (responseData.error) {
        console.log(responseData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(
        reviewId,
        data.singleProductDetail._id,
        fetchData,
        setFdata
      );
      message.success("Đã xóa đánh giá");
    } catch (error) {
      message.error("Không thể xóa đánh giá");
    }
  };

  return (
    <Fragment>
      {pRatingsReviews && pRatingsReviews.length > 0 ? (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {pRatingsReviews.map((item, index) => {
            const currentUser = isAuthenticate();
            const isOwnReview = currentUser && item.user && item.user._id === currentUser.user._id;

            return (
              <Card
                key={index}
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                bodyStyle={{ padding: "20px" }}
              >
                <Space align="start" size="middle" style={{ width: "100%" }}>
                  <Avatar
                    size={48}
                    src={
                      item.user && item.user.userImage
                        ? `${apiURL}/uploads/users/${item.user.userImage}`
                        : null
                    }
                    icon={!item.user?.userImage && <UserOutlined />}
                    style={{ flexShrink: 0 }}
                  >
                    {item.user && !item.user.userImage
                      ? item.user.name.charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <Text strong style={{ fontSize: "16px", display: "block" }}>
                          {item.user ? item.user.name : "Người dùng ẩn danh"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {moment(item.createdAt).format("DD/MM/YYYY")}
                        </Text>
                      </div>
                      <Rate
                        disabled
                        defaultValue={Number(item.rating)}
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                    <Paragraph
                      style={{
                        margin: "12px 0 0 0",
                        color: "#595959",
                        lineHeight: "1.8",
                      }}
                    >
                      {item.review}
                    </Paragraph>
                    {isOwnReview && (
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item._id)}
                        style={{ padding: 0, marginTop: "12px" }}
                      >
                        Xóa đánh giá
                      </Button>
                    )}
                  </div>
                </Space>
              </Card>
            );
          })}
        </Space>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text strong style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}>
                Chưa có đánh giá nào
              </Text>
              <Text type="secondary">Hãy là người đầu tiên đánh giá sản phẩm này!</Text>
            </div>
          }
        />
      )}
    </Fragment>
  );
};

export default AllReviews;
