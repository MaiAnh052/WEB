import React from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const InventoryMenu = ({ fetchData }) => {
  return (
    <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h3 style={{ margin: 0 }}>Quản lý kho hàng</h3>
      </div>
      <Button icon={<ReloadOutlined />} onClick={fetchData}>
        Làm mới
      </Button>
    </div>
  );
};

export default InventoryMenu;

