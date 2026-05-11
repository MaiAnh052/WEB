import React, { Fragment, useContext, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { DashboardContext } from "./";
import { GetAllData } from "./Action";

const { Title } = Typography;

const DashboardCard = (props) => {
  const { data, dispatch } = useContext(DashboardContext);

  useEffect(() => {
    GetAllData(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  };

  const iconStyle = {
    fontSize: "32px",
    padding: "12px",
    borderRadius: "12px",
  };

  return (
    <Fragment>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px", marginTop: 0 }}>
          Tổng quan
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={cardStyle}
              bodyStyle={{ padding: "24px" }}
            >
              <Statistic
                title={
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    Khách hàng
                  </span>
                }
                value={data ? data.totalData.Users : 0}
                prefix={
                  <UserOutlined
                    style={{
                      ...iconStyle,
                      background: "rgba(24, 144, 255, 0.1)",
                      color: "#1890ff",
                    }}
                  />
                }
                suffix={
                  <span style={{ fontSize: "14px", color: "#52c41a" }}>
                    <ArrowUpOutlined /> 7%
                  </span>
                }
                valueStyle={{ fontSize: "28px", fontWeight: 600, color: "#262626" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={cardStyle}
              bodyStyle={{ padding: "24px" }}
            >
              <Statistic
                title={
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    Đơn hàng
                  </span>
                }
                value={data ? data.totalData.Orders : 0}
                prefix={
                  <ShoppingCartOutlined
                    style={{
                      ...iconStyle,
                      background: "rgba(255, 77, 79, 0.1)",
                      color: "#ff4d4f",
                    }}
                  />
                }
                suffix={
                  <span style={{ fontSize: "14px", color: "#52c41a" }}>
                    <ArrowUpOutlined /> 10%
                  </span>
                }
                valueStyle={{ fontSize: "28px", fontWeight: 600, color: "#262626" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={cardStyle}
              bodyStyle={{ padding: "24px" }}
            >
              <Statistic
                title={
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    Sản phẩm
                  </span>
                }
                value={data ? data.totalData.Products : 0}
                prefix={
                  <ShoppingOutlined
                    style={{
                      ...iconStyle,
                      background: "rgba(82, 196, 26, 0.1)",
                      color: "#52c41a",
                    }}
                  />
                }
                valueStyle={{ fontSize: "28px", fontWeight: 600, color: "#262626" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={cardStyle}
              bodyStyle={{ padding: "24px" }}
            >
              <Statistic
                title={
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>
                    Danh mục
                  </span>
                }
                value={data ? data.totalData.Categories : 0}
                prefix={
                  <AppstoreOutlined
                    style={{
                      ...iconStyle,
                      background: "rgba(250, 173, 20, 0.1)",
                      color: "#faad14",
                    }}
                  />
                }
                valueStyle={{ fontSize: "28px", fontWeight: 600, color: "#262626" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default DashboardCard;
