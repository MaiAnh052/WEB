import React, { Fragment, useContext } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Card, Avatar, Menu, Typography, Space } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { logout } from "./Action";
import { DashboardUserContext } from "./Layout";

const { Text } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

const Sidebar = (props) => {
  const { data } = useContext(DashboardUserContext);
  const history = useHistory();
  const location = useLocation();

  // Menu items configuration
  const menuItems = [
    {
      key: "/user/orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng của tôi",
      path: "/user/orders",
    },
    {
      key: "/user/profile",
      icon: <IdcardOutlined />,
      label: "Tài khoản của tôi",
      path: "/user/profile",
    },
    {
      key: "/wish-list",
      icon: <HeartOutlined />,
      label: "Yêu thích",
      path: "/wish-list",
    },
    {
      key: "/user/setting",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      path: "/user/setting",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: () => logout(),
    },
  ];

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((item) => item.key === key);
    if (item && item.path) {
      history.push(item.path);
    } else if (item && item.onClick) {
      item.onClick();
    }
  };

  // Get user avatar URL or use default
  const userAvatar = data.userDetails?.userImage
    ? `${apiURL}/uploads/users/${data.userDetails.userImage}`
    : null;

  return (
    <Fragment>
      <div
        style={{
          width: "100%",
          marginBottom: 16,
          maxWidth: 280,
        }}
        className="md:w-2/12"
      >
        {/* User Profile Card */}
        <Card
          style={{
            background: "#303031",
            border: "none",
            borderRadius: 12,
            marginBottom: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Space direction="horizontal" size={16} style={{ width: "100%" }}>
            <Avatar
              size={64}
              src={userAvatar}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.3)",
              }}
            />
            <div style={{ flex: 1, color: "white" }}>
              <Text
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Xin chào,
              </Text>
              <Text
                strong
                style={{
                  display: "block",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {data.userDetails ? data.userDetails.name : "Người dùng"}
              </Text>
            </div>
          </Space>
        </Card>

        {/* Navigation Menu */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              border: "none",
              borderRadius: 12,
            }}
            className="user-dashboard-menu"
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              danger: item.danger,
            }))}
          />
        </Card>
      </div>
    </Fragment>
  );
};

export default Sidebar;
