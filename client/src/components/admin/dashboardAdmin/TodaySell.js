import React, { Fragment, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { Card, Table, Tag, Button, Image, Empty, Typography, Space } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import { DashboardContext } from "./";
import { todayAllOrders } from "./Action";

const { Title, Text } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

const SellTable = () => {
  const history = useHistory();
  const { data, dispatch } = useContext(DashboardContext);

  useEffect(() => {
    todayAllOrders(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordersList = () => {
    let newList = [];
    if (data.totalOrders.Orders !== undefined) {
      data.totalOrders.Orders.forEach(function (elem) {
        if (moment(elem.createdAt).format("LL") === moment().format("LL")) {
          newList = [...newList, elem];
        }
      });
    }
    return newList;
  };

  const orders = ordersList();
  const orderCount = orders.length;

  const columns = [
    {
      title: "Sản phẩm",
      key: "products",
      width: 200,
      render: (_, record) => (
        <div>
          {record.allProduct && record.allProduct.map((item, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              <Text strong>{item.id?.pName || "N/A"}</Text>
              <Text type="secondary" style={{ marginLeft: "8px" }}>
                x{item.quantitiy}
              </Text>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      key: "images",
      width: 120,
      render: (_, record) => (
        <Space>
          {record.allProduct && record.allProduct.map((item, index) => (
            <Image
              key={index}
              width={50}
              height={50}
              src={`${apiURL}/uploads/products/${item.id?.pImages?.[0] || ""}`}
              alt={item.id?.pName || "Product"}
              style={{ objectFit: "cover", borderRadius: "4px" }}
              preview={false}
            />
          ))}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          "Not processed": { color: "error", text: "Chưa xử lý" },
          Processing: { color: "processing", text: "Đang xử lý" },
          Shipped: { color: "blue", text: "Đang giao hàng" },
          Delivered: { color: "success", text: "Đã giao hàng" },
          Cancelled: { color: "default", text: "Đã hủy" },
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address) => <Text ellipsis style={{ maxWidth: 200 }}>{address}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <Text type="secondary">{moment(date).format("DD/MM/YYYY HH:mm")}</Text>
      ),
    },
  ];

  return (
    <Fragment>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            <ShoppingCartOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Đơn hàng hôm nay
            <Tag color="blue" style={{ marginLeft: "12px" }}>
              {orderCount}
            </Tag>
          </Title>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => history.push("/admin/dashboard/orders")}
          >
            Xem tất cả
          </Button>
        </div>
        {orderCount > 0 ? (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 800 }}
            size="middle"
          />
        ) : (
          <Empty
            description="Không có đơn hàng nào hôm nay"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </Fragment>
  );
};


const TodaySell = (props) => {
  return <SellTable />;
};

export default TodaySell;
