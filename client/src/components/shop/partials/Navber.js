import React, { Fragment, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Badge, Dropdown, Space } from "antd";
import {
  HeartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import "./style.css";

import { logout } from "./Action";
import { LayoutContext } from "../index";

const { Header } = Layout;

const Navber = (props) => {
  const history = useHistory();
  const location = useLocation();

  const { data, dispatch } = useContext(LayoutContext);

  const navberToggleOpen = () =>
    data.navberHamburger
      ? dispatch({ type: "hamburgerToggle", payload: false })
      : dispatch({ type: "hamburgerToggle", payload: true });

  const loginModalOpen = () =>
    data.loginSignupModal
      ? dispatch({ type: "loginSignupModalToggle", payload: false })
      : dispatch({ type: "loginSignupModalToggle", payload: true });

  const cartModalOpen = () =>
    data.cartModal
      ? dispatch({ type: "cartModalToggle", payload: false })
      : dispatch({ type: "cartModalToggle", payload: true });

  // User menu items
  const userMenuItems = [
    {
      key: "orders",
      icon: <FileTextOutlined />,
      label: "Đơn hàng của tôi",
      onClick: () => history.push("/user/orders"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Tài khoản",
      onClick: () => history.push("/user/profile"),
    },
    {
      key: "wishlist",
      icon: <HeartOutlined />,
      label: "Yêu thích",
      onClick: () => history.push("/wish-list"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => history.push("/user/setting"),
    },
    
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: () => logout(),
    },
  ];

  const isLoggedIn = localStorage.getItem("jwt");

  return (
    <Fragment>
      <Header
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1000,
          width: "100%",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: "0 24px",
          height: "64px",
          lineHeight: "64px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div
            onClick={() => history.push("/")}
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1890ff",
              cursor: "pointer",
              marginRight: "40px",
            }}
          >
            Ecommerce
          </div>

          {/* Desktop Navigation */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{
              border: "none",
              background: "transparent",
              flex: 1,
            }}
            className="hidden lg:flex"
          >
            <Menu.Item key="/" onClick={() => history.push("/")}>
              Cửa hàng
            </Menu.Item>
            <Menu.Item key="/blog" onClick={() => history.push("/blog")}>
              Blog
            </Menu.Item>
            <Menu.Item key="/contact-us" onClick={() => history.push("/contact-us")}>
              Liên hệ
            </Menu.Item>
          </Menu>

          {/* Right Actions */}
          <Space size="middle" style={{ marginLeft: "auto" }}>
            {/* Wishlist */}
            <Button
              type="text"
              icon={<HeartOutlined />}
              onClick={() => history.push("/wish-list")}
              style={{
                color: location.pathname === "/wish-list" ? "#1890ff" : "#595959",
              }}
            />

            {/* User Menu */}
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  style={{ color: "#595959" }}
                />
              </Dropdown>
            ) : (
              <Button
                type="text"
                icon={<LoginOutlined />}
                onClick={loginModalOpen}
                style={{ color: "#595959" }}
              >
                Đăng nhập
              </Button>
            )}

            {/* Cart */}
            <Badge
              count={data.cartProduct !== null ? data.cartProduct.length : 0}
              showZero={false}
            >
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                onClick={cartModalOpen}
                style={{ color: "#595959" }}
              />
            </Badge>

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={navberToggleOpen}
              className="lg:hidden"
              style={{
                color: "#595959",
              }}
            />
          </Space>
        </div>
      </Header>

      {/* Mobile Menu */}
      {data.navberHamburger && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 999,
            padding: "16px",
          }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            style={{ border: "none" }}
          >
            <Menu.Item key="/" onClick={() => {
              history.push("/");
              dispatch({ type: "hamburgerToggle", payload: false });
            }}>
              Cửa hàng
            </Menu.Item>
            <Menu.Item key="/blog" onClick={() => {
              history.push("/blog");
              dispatch({ type: "hamburgerToggle", payload: false });
            }}>
              Blog
            </Menu.Item>
            <Menu.Item key="/contact-us" onClick={() => {
              history.push("/contact-us");
              dispatch({ type: "hamburgerToggle", payload: false });
            }}>
              Liên hệ
            </Menu.Item>
          </Menu>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: "64px" }} />
    </Fragment>
  );
};

export default Navber;
