import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined } from "@ant-design/icons";
import { confirmVNPayPayment } from "./FetchApi";

const VNPayReturn = () => {
  const history = useHistory();
  const location = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const orderId = params.get("orderId");
    const vnpResponseCode = params.get("vnp_ResponseCode");
    const vnpTransactionNo = params.get("vnp_TransactionNo");
    const vnpTxnRef = params.get("vnp_TxnRef");

    const isSuccess = status === "success" || vnpResponseCode === "00";
    if (isSuccess && (orderId || vnpResponseCode === "00")) {
      localStorage.setItem("cart", JSON.stringify([]));
    }

    if (vnpResponseCode === "00" && !orderId && vnpTransactionNo && vnpTxnRef && !isConfirming && !confirmedOrderId) {
      setIsConfirming(true);
      
      confirmVNPayPayment({
        transactionId: vnpTxnRef,
        vnpTransactionNo: vnpTransactionNo,
        vnpResponseCode: vnpResponseCode
      })
      .then((response) => {
        if (response.success && response.orderId) {
          setConfirmedOrderId(response.orderId);
          localStorage.setItem("cart", JSON.stringify([]));
        }
        setIsConfirming(false);
      })
      .catch((error) => {
        setIsConfirming(false);
      });
    }
  }, [location, isConfirming, confirmedOrderId]);

  const params = new URLSearchParams(location.search);
  const status = params.get("status");
  const orderId = params.get("orderId");
  const message = params.get("message");
  const code = params.get("code");
  
  const vnpResponseCode = params.get("vnp_ResponseCode");
  const vnpTransactionNo = params.get("vnp_TransactionNo");
  const vnpAmount = params.get("vnp_Amount");
  
  const isPaymentSuccess = vnpResponseCode === "00";
  const finalOrderId = confirmedOrderId || orderId;
  const finalStatus = vnpResponseCode ? (isPaymentSuccess ? "success" : "failed") : status;
  if (isConfirming && isPaymentSuccess) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px", textAlign: "center" }}>
        <Spin size="large" tip="Đang xác nhận thanh toán và tạo đơn hàng..." />
      </div>
    );
  }

  if (finalStatus === "success") {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title="Thanh toán thành công!"
          subTitle={
            <div>
              <p>Đơn hàng của bạn đã được thanh toán thành công.</p>
              {vnpResponseCode && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã phản hồi VNPay:</strong> {vnpResponseCode} (Thành công)
                </p>
              )}
              {vnpTransactionNo && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã giao dịch VNPay:</strong> {vnpTransactionNo}
                </p>
              )}
              {finalOrderId && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã đơn hàng:</strong> {finalOrderId}
                </p>
              )}
              <p style={{ marginTop: "8px", color: "#8c8c8c" }}>
                Chúng tôi sẽ xử lý và giao hàng cho bạn trong thời gian sớm nhất.
              </p>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="home"
              icon={<HomeOutlined />}
              onClick={() => history.push("/")}
              size="large"
            >
              Về trang chủ
            </Button>,
            <Button
              key="orders"
              onClick={() => history.push("/user/orders")}
              size="large"
            >
              Xem đơn hàng
            </Button>,
          ]}
        />
      </div>
    );
  } else {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
          title="Thanh toán thất bại"
          subTitle={
            <div>
              <p>{message || "Giao dịch thanh toán không thành công."}</p>
              {code && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã lỗi:</strong> {code}
                </p>
              )}
              {vnpResponseCode && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã phản hồi VNPay:</strong> {vnpResponseCode}
                  {String(vnpResponseCode) === "00" && " (Thành công)"}
                  {String(vnpResponseCode) !== "00" && " (Thất bại)"}
                </p>
              )}
              {vnpTransactionNo && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã giao dịch VNPay:</strong> {vnpTransactionNo}
                </p>
              )}
              {orderId && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Mã đơn hàng:</strong> {orderId}
                </p>
              )}
              <p style={{ marginTop: "8px", color: "#8c8c8c" }}>
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </p>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="home"
              icon={<HomeOutlined />}
              onClick={() => history.push("/")}
              size="large"
            >
              Về trang chủ
            </Button>,
            <Button
              key="checkout"
              onClick={() => history.push("/checkout")}
              size="large"
            >
              Thử lại
            </Button>,
          ]}
        />
      </div>
    );
  }
};

export default VNPayReturn;

