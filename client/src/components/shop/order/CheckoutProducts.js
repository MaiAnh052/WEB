import React, { Fragment, useEffect, useContext, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Spin,
  Alert,
  Empty,
  Typography,
  Divider,
  Space,
  Image,
  Tag,
  Radio,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
  DollarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { LayoutContext } from "../layout";
import { formatVND } from "../../../utils/formatCurrency";
import AddressSelector from "./AddressSelector";
import { validateVoucher } from "../../admin/vouchers/FetchApi";

import { cartListProduct } from "../partials/FetchApi";
import { fetchData, pay } from "./Action";
import { getSingleProduct } from "../productDetails/FetchApi";

const { Title, Text } = Typography;
const apiURL = process.env.REACT_APP_API_URL;

export const CheckoutComponent = (props) => {
  const history = useHistory();
  const location = useLocation();
  const { data, dispatch } = useContext(LayoutContext);
  const [form] = Form.useForm();

  const isBuyNow = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return params.get("buyNow") === "1" || localStorage.getItem("buyNowActive") === "1";
  }, [location.search]);

  const buyNowCart = useMemo(() => {
    if (!isBuyNow) return [];
    try {
      const parsed = JSON.parse(localStorage.getItem("buyNowCart")) || [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [isBuyNow]);

  const [buyNowProducts, setBuyNowProducts] = useState(null);

  const [state, setState] = useState({
    address: "",
    phone: "",
    paymentMethod: "COD",
    error: false,
    success: false,
  });

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (isBuyNow) {
        dispatch({ type: "loading", payload: true });
        try {
          if (!buyNowCart || buyNowCart.length === 0) {
            setBuyNowProducts([]);
            return;
          }
          const productId = buyNowCart[0].id;
          const res = await getSingleProduct(productId);
          if (res && res.Product) {
            setBuyNowProducts([res.Product]);
          } else {
            setBuyNowProducts([]);
          }
        } catch (e) {
          setBuyNowProducts([]);
        } finally {
          dispatch({ type: "loading", payload: false });
        }
      } else {
        fetchData(cartListProduct, dispatch);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuyNow]);

  const onFinish = async (values) => {
    // Lấy paymentMethod từ form values
    const paymentMethod = values.paymentMethod || "COD";
    
    const formData = {
      address: values.address,
      phone: values.phone,
      paymentMethod: paymentMethod,
      error: false,
      success: false,
      voucherCode: appliedVoucher?.code || null,
      voucherId: appliedVoucher?._id || null,
      discountAmount: discountAmount,
      finalAmount: finalTotalAmount,
      baseAmount: baseTotalAmount, // Giá gốc trước khi giảm
    };
    
    // Gọi hàm pay với paymentMethod đã được xác định
    // Truyền baseAmount để tính đúng giá gốc
    await pay(data, dispatch, formData, setState, () => baseTotalAmount, history);
  };

  if (data.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  const calculateTotalAmount = () => {
    // Tính tổng giá gốc theo nguồn cart (buyNowCart hoặc cart thường)
    const carts = isBuyNow ? buyNowCart : (JSON.parse(localStorage.getItem("cart")) || []);
    const products = isBuyNow ? buyNowProducts : data.cartProduct;

    const baseTotal = carts.reduce((sum, cartItem) => {
      // Ưu tiên giá từ variant, nếu không có thì tìm giá từ product
      let itemPrice = 0;
      if (cartItem.variant && cartItem.variant.price) {
        itemPrice = cartItem.variant.price;
      } else if (cartItem.price) {
        itemPrice = cartItem.price;
      } else if (products) {
        const product = products.find(p => p._id === cartItem.id);
        if (product) {
          itemPrice = product.pPrice || 0;
        }
      }
      return sum + (itemPrice * (cartItem.quantitiy || 1));
    }, 0);
    return baseTotal;
  };

  const baseTotalAmount = calculateTotalAmount();
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotalAmount = Math.max(0, baseTotalAmount - discountAmount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning("Vui lòng nhập mã voucher");
      return;
    }

    setVoucherLoading(true);
    try {
      const response = await validateVoucher(voucherCode.trim(), baseTotalAmount);
      if (response.success && response.voucher) {
        setAppliedVoucher(response.voucher);
        message.success("Áp dụng voucher thành công!");
        form.setFieldsValue({ voucherCode: voucherCode.trim() });
      } else {
        message.error(response.error || "Mã voucher không hợp lệ");
        setAppliedVoucher(null);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi kiểm tra voucher");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    form.setFieldsValue({ voucherCode: "" });
    message.info("Đã xóa voucher");
  };

  return (
    <Fragment>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => history.push("/")}
              style={{ marginBottom: "16px" }}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <ShoppingCartOutlined /> Thanh toán
            </Title>
            <Text type="secondary">Vui lòng kiểm tra thông tin đơn hàng và điền thông tin giao hàng</Text>
          </div>

          <Row gutter={[24, 24]}>
            {/* Products List */}
            <Col xs={24} lg={14}>
              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    <span>{isBuyNow ? "Sản phẩm thanh toán" : "Sản phẩm trong giỏ hàng"}</span>
                    {(() => {
                      const list = isBuyNow ? buyNowProducts : data.cartProduct;
                      return list ? (
                        <Tag color="blue">{list.length} sản phẩm</Tag>
                      ) : null;
                    })()}
                  </Space>
                }
                style={{ borderRadius: "12px" }}
                bodyStyle={{ padding: "16px" }}
              >
                <CheckoutProducts
                  products={isBuyNow ? buyNowProducts : data.cartProduct}
                  cartOverride={isBuyNow ? buyNowCart : null}
                  emptyText={isBuyNow ? "Không có sản phẩm nào để thanh toán" : "Không có sản phẩm nào trong giỏ hàng"}
                />
              </Card>
            </Col>

            {/* Order Form */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined />
                    <span>Thông tin giao hàng</span>
                  </Space>
                }
                style={{ borderRadius: "12px" }}
                bodyStyle={{ padding: "24px" }}
              >
                {state.error && (
                  <Alert
                    message={state.error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setState({ ...state, error: false })}
                    style={{ marginBottom: "24px" }}
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    address: state.address,
                    phone: state.phone,
                  }}
                >
                  <Form.Item
                    label={
                      <Space>
                        <EnvironmentOutlined />
                        <span>Địa chỉ giao hàng</span>
                      </Space>
                    }
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng chọn địa chỉ giao hàng đầy đủ" },
                      { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự" },
                    ]}
                  >
                    <AddressSelector
                      value={form.getFieldValue("address")}
                      onChange={(value) => {
                        form.setFieldsValue({ address: value });
                      }}
                      form={form}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <span>Số điện thoại</span>
                      </Space>
                    }
                    name="phone"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại" },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ (10-11 số)",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số điện thoại"
                      prefix="+84"
                      maxLength={11}
                    />
                  </Form.Item>

                  <Divider />

                  {/* Payment Method */}
                  <Form.Item
                    label={
                      <Space>
                        <CreditCardOutlined />
                        <span>Phương thức thanh toán <span className="text-red-500">*</span></span>
                      </Space>
                    }
                    name="paymentMethod"
                    initialValue="COD"
                    rules={[
                      { required: true, message: "Vui lòng chọn phương thức thanh toán" },
                    ]}
                  >
                    <Radio.Group>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Radio value="COD">
                          <Space>
                            <DollarOutlined />
                            <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                            <Tag color="green">Miễn phí</Tag>
                          </Space>
                        </Radio>
                        <Radio value="VNPAY">
                          <Space>
                            <CreditCardOutlined />
                            <span>Thanh toán qua VNPay</span>
                            <Tag color="blue">An toàn</Tag>
                          </Space>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Divider />

                  {/* Voucher Section */}
                  <Form.Item label={
                    <Space>
                      <TagOutlined />
                      <span>Mã giảm giá</span>
                    </Space>
                  }>
                    <Space.Compact style={{ width: "100%" }}>
                      <Input
                        placeholder="Nhập mã voucher"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          if (appliedVoucher) setAppliedVoucher(null);
                        }}
                        disabled={voucherLoading || !!appliedVoucher}
                        onPressEnter={handleApplyVoucher}
                      />
                      {appliedVoucher ? (
                        <Button
                          danger
                          onClick={handleRemoveVoucher}
                        >
                          Xóa
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          loading={voucherLoading}
                          onClick={handleApplyVoucher}
                        >
                          Áp dụng
                        </Button>
                      )}
                    </Space.Compact>
                    {appliedVoucher && (
                      <div style={{ marginTop: "8px" }}>
                        <Tag color="green">
                          {appliedVoucher.name} - Giảm {formatVND(discountAmount)}
                        </Tag>
                      </div>
                    )}
                  </Form.Item>

                  <Divider />

                  {/* Order Summary */}
                  <div
                    style={{
                      background: "#f5f5f5",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text>Tổng tiền hàng:</Text>
                        <Text>{formatVND(baseTotalAmount)}</Text>
                      </div>
                      {appliedVoucher && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text>Giảm giá ({appliedVoucher.code}):</Text>
                            <Text type="success" strong>
                              -{formatVND(discountAmount)}
                            </Text>
                          </div>
                          <Divider style={{ margin: "8px 0" }} />
                        </>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong>Tổng thanh toán:</Text>
                        <Text strong style={{ fontSize: "20px", color: "#1890ff" }}>
                          {formatVND(finalTotalAmount)}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        * Phí vận chuyển sẽ được tính khi xác nhận đơn hàng
                      </Text>
                    </Space>
                  </div>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      icon={<CheckCircleOutlined />}
                      style={{
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      Đặt hàng
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Space>
      </div>
    </Fragment>
  );
};

const CheckoutProducts = ({ products, cartOverride, emptyText }) => {
  const history = useHistory();

  if (!products || products.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={emptyText || "Không có sản phẩm nào"}
      >
        <Button type="primary" onClick={() => history.push("/")}>
          Tiếp tục mua sắm
        </Button>
      </Empty>
    );
  }

  const carts = cartOverride || (JSON.parse(localStorage.getItem("cart")) || []);
  const totalAmount = (carts || []).reduce((sum, cartItem) => {
    const itemPrice = cartItem?.variant?.price || cartItem?.price || 0;
    return sum + (Number(itemPrice) * (cartItem?.quantitiy || 1));
  }, 0);

  return (
    <Fragment>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {products.map((product, index) => {
          const cartItem = carts.find(c => c.id === product._id);
          const variantInfo = cartItem?.variant;

          const qty = cartItem?.quantitiy || 0;
          const displayPrice = variantInfo?.price || cartItem?.price || product.pPrice || 0;
          const subtotal = qty * Number(displayPrice || 0);

          return (
            <Card
              key={index}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Row gutter={16} align="middle">
                <Col xs={24} sm={6}>
                  <Image
                    src={`${apiURL}/uploads/products/${product.pImages[0]}`}
                    alt={product.pName}
                    preview={false}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() => history.push(`/products/${product._id}`)}
                  />
                </Col>
                <Col xs={24} sm={18}>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => history.push(`/products/${product._id}`)}
                    >
                      {product.pName}
                    </Title>
                    {variantInfo && (
                      <div>
                        <Tag color="default" style={{ marginRight: "8px" }}>
                          Size: {variantInfo.size}
                        </Tag>
                        <Tag color="default">
                          Màu: {variantInfo.color}
                        </Tag>
                      </div>
                    )}
                    <Row gutter={16}>
                      <Col xs={12} sm={6}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Giá
                        </Text>
                        <div>
                          <Text strong>{formatVND(displayPrice)}</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Số lượng
                        </Text>
                        <div>
                          <Tag color="blue">{qty}</Tag>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ textAlign: "right" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Thành tiền
                          </Text>
                          <div>
                            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                              {formatVND(subtotal)}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </Card>
          );
        })}

        <Divider />

        {/* Total Summary */}
        <Card
          style={{
            background: "#fafafa",
            borderRadius: "8px",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong style={{ fontSize: "18px" }}>
                Tổng cộng:
              </Text>
            </Col>
            <Col>
              <Text strong style={{ fontSize: "24px", color: "#1890ff" }}>
                {formatVND(totalAmount)}
              </Text>
            </Col>
          </Row>
        </Card>
      </Space>
    </Fragment>
  );
};

export default CheckoutProducts;
