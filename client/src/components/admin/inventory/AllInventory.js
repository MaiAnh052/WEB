import React, { Fragment, useContext, useEffect, useState } from "react";
import { getAllProductWithStock, updateStock } from "./FetchApi";
import { InventoryContext } from "./index";
import { Table, InputNumber, Button, Space, Tag, Card, message, Typography, Tooltip, Spin } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

const AllInventory = () => {
  const { data, dispatch } = useContext(InventoryContext);
  const { products } = data;
  const [editingVariantKey, setEditingVariantKey] = useState("");
  const [editVariantQuantities, setEditVariantQuantities] = useState({});

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    let responseData = await getAllProductWithStock();
    if (responseData && responseData.Products) {
      dispatch({
        type: "fetchProductsAndChangeState",
        payload: responseData.Products,
      });
    } else {
      dispatch({ type: "loading", payload: false });
    }
  };

  const handleVariantEdit = (productId, variantIndex) => {
    const product = products.find((p) => p._id === productId);
    if (product && product.pVariants && product.pVariants[variantIndex]) {
      const variant = product.pVariants[variantIndex];
      const key = `${productId}_${variantIndex}`;
      setEditVariantQuantities({
        ...editVariantQuantities,
        [key]: variant.quantity || 0,
      });
      setEditingVariantKey(key);
    }
  };

  const handleVariantSave = async (productId, variantIndex) => {
    const key = `${productId}_${variantIndex}`;
    const quantity = editVariantQuantities[key];
    if (quantity === undefined || quantity < 0) {
      message.error("Số lượng không hợp lệ");
      return;
    }

    dispatch({ type: "loading", payload: true });
    const response = await updateStock({
      pId: productId,
      variantIndex: variantIndex,
      variantQuantity: quantity,
    });

    if (response.error) {
      message.error(response.error);
      dispatch({ type: "loading", payload: false });
    } else if (response.success) {
      message.success("Cập nhật số lượng variant thành công!");
      dispatch({
        type: "updateProductStock",
        productId: productId,
        updatedProduct: response.product,
      });
      setEditingVariantKey("");
      setEditVariantQuantities({});
      dispatch({ type: "loading", payload: false });
    }
  };

  const handleVariantCancel = () => {
    setEditingVariantKey("");
    setEditVariantQuantities({});
  };

  const handleRefresh = () => {
    fetchData();
  };

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {record.pImages && record.pImages.length > 0 && (
            <img
              src={`${apiURL}/uploads/products/${record.pImages[0]}`}
              alt={record.pName}
              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.pName}</div>
            {record.pCategory && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.pCategory.cName || "N/A"}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng số lượng",
      key: "quantity",
      render: (_, record) => {
        // Tính tổng số lượng từ các variant nếu có
        let totalQuantity = record.pQuantity || 0;
        if (record.pVariants && record.pVariants.length > 0) {
          totalQuantity = record.pVariants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
        }
        
        return (
          <Tag color={totalQuantity > 0 ? "green" : "red"}>
            {totalQuantity}
          </Tag>
        );
      },
    },
    {
      title: "Biến thể",
      key: "variants",
      render: (_, record) => {
        if (!record.pVariants || record.pVariants.length === 0) {
          return <Text type="secondary">Không có biến thể</Text>;
        }
        return (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {record.pVariants.map((variant, index) => {
              const variantKey = `${record._id}_${index}`;
              const isVariantEditing = editingVariantKey === variantKey;
              
              return (
                <div
                  key={index}
                  style={{
                    padding: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Tag>Size: {variant.size}</Tag>
                    <Tag>Màu: {variant.color}</Tag>
                    <Text strong style={{ marginLeft: 8 }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(variant.price)}
                    </Text>
                  </div>
                  {isVariantEditing ? (
                    <Space>
                      <InputNumber
                        min={0}
                        value={editVariantQuantities[variantKey]}
                        onChange={(value) =>
                          setEditVariantQuantities({
                            ...editVariantQuantities,
                            [variantKey]: value,
                          })
                        }
                        style={{ width: 100 }}
                      />
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        size="small"
                        onClick={() => handleVariantSave(record._id, index)}
                      />
                      <Button
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={handleVariantCancel}
                      />
                    </Space>
                  ) : (
                    <Space>
                      <Tag color={variant.quantity > 0 ? "green" : "red"}>
                        SL: {variant.quantity || 0}
                      </Tag>
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => handleVariantEdit(record._id, index)}
                        />
                      </Tooltip>
                    </Space>
                  )}
                </div>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag color={record.pStatus === "active" ? "green" : "default"}>
          {record.pStatus === "active" ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
    },
    {
      title: "Cập nhật",
      key: "updatedAt",
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {moment(record.updatedAt).format("DD/MM/YYYY HH:mm")}
        </Text>
      ),
    },
  ];

  if (data.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Fragment>
      <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Title level={2} style={{ marginBottom: 8, marginTop: 0 }}>
              Quản lý kho hàng
            </Title>
            <Text type="secondary">
              Cập nhật số lượng biến thể trong kho. Tổng số lượng sẽ được tính tự động từ các biến thể.
            </Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </Fragment>
  );
};

export default AllInventory;

