import React, { Fragment, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Card, Form, Rate, Input, Button, Alert, message } from "antd";
import { SendOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { reviewSubmitHanlder } from "./Action";
import { LayoutContext } from "../layout";
import { isAuthenticate } from "../auth/fetchApi";
import { getSingleProduct } from "./FetchApi";

const { TextArea } = Input;

const ReviewForm = (props) => {
  const { data, dispatch } = useContext(LayoutContext);
  let { id } = useParams();

  const [fData, setFdata] = useState({
    rating: "",
    review: "",
    error: false,
    success: false,
    pId: id,
  });

  const [form] = Form.useForm();

  if (fData.error || fData.success) {
    setTimeout(() => {
      setFdata({ ...fData, error: false, success: false });
    }, 3000);
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

  const ratingUserList = data.singleProductDetail.pRatingsReviews.map(
    (item) => {
      return item.user ? item.user._id : "";
    }
  );

  const hasReviewed = ratingUserList.includes(isAuthenticate()?.user?._id);

  const onFinish = async (values) => {
    const formData = {
      ...fData,
      rating: values.rating,
      review: values.review,
    };
    await reviewSubmitHanlder(formData, setFdata, fetchData);
    if (formData.success) {
      form.resetFields();
      message.success("Đánh giá đã được gửi thành công!");
    }
  };

  return (
    <Fragment>
      {fData.error && (
        <Alert
          message={fData.error}
          type="error"
          showIcon
          closable
          style={{ marginTop: "24px", marginBottom: "16px" }}
        />
      )}

      {hasReviewed ? (
        <Alert
          message="Bạn đã đánh giá sản phẩm này rồi"
          type="info"
          icon={<CheckCircleOutlined />}
          showIcon
          style={{ marginTop: "24px" }}
        />
      ) : (
        <Card
          title={
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                Viết đánh giá
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#8c8c8c", fontWeight: "normal" }}>
                Chia sẻ ý kiến của bạn với khách hàng khác
              </p>
            </div>
          }
          style={{
            marginTop: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ rating: 0 }}
          >
            <Form.Item
              label={
                <span>
                  Đánh giá của bạn <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              name="rating"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn số sao đánh giá",
                  validator: (_, value) => {
                    if (value && value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Vui lòng chọn số sao đánh giá"));
                  },
                },
              ]}
            >
              <Rate allowClear style={{ fontSize: "24px" }} />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  Nội dung đánh giá <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              name="review"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung đánh giá" },
                { min: 10, message: "Đánh giá phải có ít nhất 10 ký tự" },
              ]}
            >
              <TextArea
                rows={5}
                placeholder="Hãy chia sẻ suy nghĩ của bạn về sản phẩm này..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                size="large"
                style={{ width: "100%" }}
              >
                Gửi đánh giá
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Fragment>
  );
};

export default ReviewForm;
