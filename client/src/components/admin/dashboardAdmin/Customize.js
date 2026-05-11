import React, { Fragment, useContext, useEffect } from "react";
import { Card, Button, Upload, Image, Spin, Empty, Typography, Space, message } from "antd";
import { PlusOutlined, DeleteOutlined, CloseOutlined, PictureOutlined } from "@ant-design/icons";
import { DashboardContext } from "./";
import { uploadImage, sliderImages, deleteImage } from "./Action";

const { Title } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

const Customize = () => {
  const { data, dispatch } = useContext(DashboardContext);

  return (
    <Fragment>
      {!data.uploadSliderBtn ? (
          <Card
            hoverable
            onClick={() =>
              dispatch({
                type: "uploadSliderBtn",
                payload: !data.uploadSliderBtn,
              })
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <Space direction="vertical" size="middle">
              <PictureOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Tùy chỉnh Slider
              </Title>
              <Button type="primary" icon={<PlusOutlined />} size="large">
                Quản lý hình ảnh slider
              </Button>
            </Space>
          </Card>
        ) : (
          <UploadImageSection />
        )}
    </Fragment>
  );
};

const UploadImageSection = () => {
  const { data, dispatch } = useContext(DashboardContext);

  const uploadImageHandler = (file) => {
    if (file) {
      uploadImage(file, dispatch);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      uploadImageHandler(file);
      return false;
    },
    accept: ".jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff",
    showUploadList: false,
  };

  return (
    <Fragment>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "24px" }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>
              <PictureOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
              Quản lý Slider
            </Title>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() =>
                dispatch({
                  type: "uploadSliderBtn",
                  payload: false,
                })
              }
            />
          </div>
        }
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Tải lên hình ảnh
            </Button>
          </Upload>
          <AllImages />
        </Space>
      </Card>
    </Fragment>
  );
};

const AllImages = () => {
  const { data, dispatch } = useContext(DashboardContext);

  useEffect(() => {
    sliderImages(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteImageReq = (id) => {
    deleteImage(id, dispatch);
    message.success("Đã xóa hình ảnh");
  };

  if (data.imageUpload) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Đang tải lên..." />
      </div>
    );
  }

  return (
    <Fragment>
      {data.sliderImages.length > 0 ? (
        <div>
          <Title level={5} style={{ marginBottom: "16px" }}>
            Hình ảnh slider ({data.sliderImages.length})
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {data.sliderImages.map((item, index) => (
              <Card
                key={index}
                hoverable
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                }}
                bodyStyle={{ padding: 0 }}
                cover={
                  <Image
                    src={`${apiURL}/uploads/customize/${item.slideImage}`}
                    alt={`Slider ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                    preview={true}
                  />
                }
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteImageReq(item._id)}
                    style={{ width: "100%" }}
                  >
                    Xóa
                  </Button>,
                ]}
              />
            ))}
          </div>
        </div>
      ) : (
        <Empty
          description="Chưa có hình ảnh slider nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Fragment>
  );
};

export default Customize;
