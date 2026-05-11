import React, { Fragment, useEffect, useContext } from "react";
import moment from "moment";
import { Card, Tag, Spin, Empty, Row, Col, Divider, Typography, Space } from "antd";
import {
  ShoppingOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { fetchOrderByUser } from "./Action";
import Layout, { DashboardUserContext } from "./Layout";
import { formatVND } from "../../../utils/formatCurrency";

const { Title, Text } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

// Hàm lấy màu và icon cho status
const getStatusConfig = (status, paymentStatus) => {
  const statusMap = {
    "Not processed": {
      color: "red",
      icon: <CloseCircleOutlined />,
      text: "Chưa xử lý",
    },
    Processing: {
      color: "orange",
      icon: <ClockCircleOutlined />,
      text: "Đang xử lý",
    },
    Shipped: {
      color: "blue",
      icon: <TruckOutlined />,
      text: "Đã giao hàng",
    },
    Delivered: {
      color: "green",
      icon: <CheckCircleOutlined />,
      text: "Đã nhận hàng",
    },
    Cancelled: {
      color: "red",
      icon: <CloseCircleOutlined />,
      text: "Đã hủy",
    },
  };

  const paymentStatusMap = {
    pending: { color: "orange", text: "Chờ thanh toán" },
    paid: { color: "green", text: "Đã thanh toán" },
    failed: { color: "red", text: "Thanh toán thất bại" },
  };

  return {
    orderStatus: statusMap[status] || statusMap["Not processed"],
    paymentStatus: paymentStatusMap[paymentStatus] || paymentStatusMap.pending,
  };
};

// Component hiển thị một đơn hàng
const OrderCard = ({ order }) => {
  const statusConfig = getStatusConfig(order.status, order.paymentStatus);

  // Tính giá gốc và giá cuối cùng để hiển thị
  // Nếu có discount, giá gốc = giá cuối + discountAmount
  const displayedFinalAmount = order.finalAmount || order.amount || 0;
  const originalAmount = order.discountAmount > 0 
    ? (displayedFinalAmount + order.discountAmount)
    : displayedFinalAmount;

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s",
      }}
      hoverable
      className="order-card"
    >
      {/* Header: Status, Date, và Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Space direction="vertical" size="small" style={{ flex: 1 }}>
          <Space wrap>
            <Tag
              icon={statusConfig.orderStatus.icon}
              color={statusConfig.orderStatus.color}
              style={{ fontSize: 13, padding: "4px 12px", margin: 0 }}
            >
              {statusConfig.orderStatus.text}
            </Tag>
            <Tag
              color={statusConfig.paymentStatus.color}
              style={{ fontSize: 13, padding: "4px 12px", margin: 0 }}
            >
              {statusConfig.paymentStatus.text}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            <CalendarOutlined /> {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </Space>
        <div style={{ textAlign: "right" }}>
          {order.discountAmount > 0 && displayedFinalAmount > 0 ? (
            <div>
              <div style={{ marginBottom: 4 }}>
                <Text delete type="secondary" style={{ fontSize: 14 }}>
                  {formatVND(originalAmount)}
                </Text>
              </div>
              <Title level={4} style={{ margin: 0, color: "#1890ff", fontSize: 20 }}>
                {formatVND(displayedFinalAmount)}
              </Title>
              <Text type="success" style={{ fontSize: 12 }}>
                Giảm {formatVND(order.discountAmount)} ({order.voucherCode})
              </Text>
            </div>
          ) : (
            <>
              <Title level={4} style={{ margin: 0, color: "#1890ff", fontSize: 20 }}>
                {formatVND(displayedFinalAmount)}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tổng tiền
              </Text>
            </>
          )}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Danh sách sản phẩm - Chiếm toàn bộ chiều rộng */}
        <Col xs={24}>
          <Title level={5} style={{ marginBottom: 16, fontSize: 16 }}>
            <ShoppingOutlined /> Sản phẩm ({order.allProduct.length})
          </Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {order.allProduct.map((product, i) => {
              // Lấy giá từ variant nếu có, nếu không thì dùng giá mặc định
              const productPrice = product.variant?.price || product.id.pPrice || 0;
              const subtotal = productPrice * (product.quantitiy || 1);
              
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 12,
                    backgroundColor: "#fafafa",
                    borderRadius: 8,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <img
                    src={`${apiURL}/uploads/products/${product.id.pImages[0]}`}
                    alt={product.id.pName}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #e8e8e8",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.id.pName}
                    </Text>
                    {product.variant && (
                      <Space size="small" style={{ marginBottom: 4 }}>
                        {product.variant.size && (
                          <Tag color="default" style={{ fontSize: 11 }}>
                            Size: {product.variant.size}
                          </Tag>
                        )}
                        {product.variant.color && (
                          <Tag color="default" style={{ fontSize: 11 }}>
                            Màu: {product.variant.color}
                          </Tag>
                        )}
                      </Space>
                    )}
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                      Số lượng: <strong>{product.quantitiy || 1}</strong>
                    </Text>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <Text strong style={{ color: "#1890ff", fontSize: 15, display: "block" }}>
                      {formatVND(subtotal)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatVND(productPrice)}/sản phẩm
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </Col>

        <Divider style={{ margin: "16px 0" }} />

        {/* Thông tin giao hàng và thanh toán - 2 cột */}
        <Col xs={24} sm={12}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
                <PhoneOutlined /> Thông tin liên hệ
              </Title>
              <Text style={{ display: "block", fontSize: 14 }}>
                <strong>SĐT:</strong> {order.phone}
              </Text>
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
                <EnvironmentOutlined /> Địa chỉ giao hàng
              </Title>
              <Text style={{ display: "block", fontSize: 14, lineHeight: 1.6 }}>
                {order.address}
              </Text>
            </div>
          </Space>
        </Col>

        <Col xs={24} sm={12}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
                <CreditCardOutlined /> Phương thức thanh toán
              </Title>
              <Tag
                color={order.paymentMethod === "VNPAY" ? "blue" : "default"}
                style={{ fontSize: 13, padding: "4px 12px" }}
              >
                {order.paymentMethod === "VNPAY" ? "VNPay" : "Thanh toán khi nhận hàng"}
              </Tag>
            </div>

            {order.transactionId && (
              <div>
                <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
                  Mã giao dịch
                </Title>
                <Text
                  copyable
                  style={{
                    fontSize: 13,
                    fontFamily: "monospace",
                    backgroundColor: "#f5f5f5",
                    padding: "4px 8px",
                    borderRadius: 4,
                    display: "inline-block",
                  }}
                >
                  {order.transactionId}
                </Text>
              </div>
            )}

            {order.updatedAt && order.updatedAt !== order.createdAt && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cập nhật: {moment(order.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Text>
              </div>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

const OrdersComponent = () => {
  const { data, dispatch } = useContext(DashboardUserContext);
  const { OrderByUser: orders } = data;

  useEffect(() => {
    fetchOrderByUser(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (data.loading) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "0 16px", marginTop: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
          Đơn hàng của tôi
        </Title>
        <Text type="secondary">
          {orders && orders.length > 0
            ? `Bạn có ${orders.length} đơn hàng`
            : "Bạn chưa có đơn hàng nào"}
        </Text>
      </div>

      {orders && orders.length > 0 ? (
        <div>
          {orders.map((order, index) => (
            <OrderCard key={order._id || index} order={order} />
          ))}
        </div>
      ) : (
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <Empty
            description={
              <span style={{ fontSize: 16, color: "#8c8c8c" }}>
                Bạn chưa có đơn hàng nào
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

const UserOrders = (props) => {
  return (
    <Fragment>
      <Layout children={<OrdersComponent />} />
    </Fragment>
  );
};

export default UserOrders;
