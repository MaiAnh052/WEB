import React, { Fragment, useContext, useEffect } from "react";
import { getAllVouchers, deleteVoucher } from "./FetchApi";
import { VoucherContext } from "./index";
import moment from "moment";
import { Tag, Popconfirm, message } from "antd";

const AllVouchers = (props) => {
  const { data, dispatch } = useContext(VoucherContext);
  const { vouchers, loading } = data;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    dispatch({ type: "loading", payload: true });
    let responseData = await getAllVouchers();
    setTimeout(() => {
      if (responseData && responseData.vouchers) {
        dispatch({
          type: "fetchVoucherAndChangeState",
          payload: responseData.vouchers,
        });
        dispatch({ type: "loading", payload: false });
      }
    }, 500);
  };

  const deleteVoucherReq = async (vId) => {
    let deleteV = await deleteVoucher(vId);
    if (deleteV.error) {
      message.error(deleteV.error);
    } else if (deleteV.success) {
      message.success(deleteV.success);
      fetchData();
    }
  };

  const editVoucher = (voucher) => {
    if (voucher) {
      dispatch({
        type: "editVoucherModalOpen",
        vId: voucher._id,
        voucher: voucher,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="col-span-1 overflow-auto bg-white shadow-lg p-4 rounded-lg">
        <table className="table-auto border w-full my-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left border">Mã Voucher</th>
              <th className="px-4 py-3 text-left border">Tên</th>
              <th className="px-4 py-3 text-left border">Loại</th>
              <th className="px-4 py-3 text-left border">Giá trị</th>
              <th className="px-4 py-3 text-left border">Đơn tối thiểu</th>
              <th className="px-4 py-3 text-left border">Đã dùng</th>
              <th className="px-4 py-3 text-left border">Ngày bắt đầu</th>
              <th className="px-4 py-3 text-left border">Ngày kết thúc</th>
              <th className="px-4 py-3 text-left border">Trạng thái</th>
              <th className="px-4 py-3 text-left border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers && vouchers.length > 0 ? (
              vouchers.map((voucher, key) => {
                return (
                  <VoucherTableRow
                    voucher={voucher}
                    editVoucher={(v) => editVoucher(v)}
                    deleteVoucher={(vId) => deleteVoucherReq(vId)}
                    key={key}
                  />
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-xl text-center font-semibold py-8"
                >
                  Chưa có voucher nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-sm text-gray-600 mt-2">
          Tổng cộng {vouchers && vouchers.length} voucher
        </div>
      </div>
    </Fragment>
  );
};

const VoucherTableRow = ({ voucher, editVoucher, deleteVoucher }) => {
  const now = new Date();
  const isExpired = new Date(voucher.endDate) < now;
  const notStarted = new Date(voucher.startDate) > now;
  const isActive = voucher.status === "active" && !isExpired && !notStarted;
  const isUsageLimitReached =
    voucher.usageLimit !== null && voucher.used >= voucher.usageLimit;

  const getStatusTag = () => {
    if (voucher.status === "inactive") {
      return <Tag color="default">Tạm dừng</Tag>;
    }
    if (isExpired) {
      return <Tag color="red">Hết hạn</Tag>;
    }
    if (notStarted) {
      return <Tag color="orange">Chưa bắt đầu</Tag>;
    }
    if (isUsageLimitReached) {
      return <Tag color="purple">Hết lượt</Tag>;
    }
    if (isActive) {
      return <Tag color="green">Hoạt động</Tag>;
    }
    return <Tag color="default">{voucher.status}</Tag>;
  };

  return (
    <Fragment>
      <tr className="hover:bg-gray-50">
        <td className="p-3 border">
          <span className="font-mono font-bold text-blue-600">
            {voucher.code}
          </span>
        </td>
        <td className="p-3 border">
          <div>
            <div className="font-semibold">
              {voucher.name.length > 30
                ? voucher.name.slice(0, 30) + "..."
                : voucher.name}
            </div>
            {voucher.description && (
              <div className="text-xs text-gray-500 mt-1">
                {voucher.description.length > 40
                  ? voucher.description.slice(0, 40) + "..."
                  : voucher.description}
              </div>
            )}
          </div>
        </td>
        <td className="p-3 border">
          {voucher.type === "percentage" ? (
            <Tag color="blue">Giảm %</Tag>
          ) : (
            <Tag color="green">Giảm tiền</Tag>
          )}
        </td>
        <td className="p-3 border">
          {voucher.type === "percentage" ? (
            <span className="font-semibold">{voucher.value}%</span>
          ) : (
            <span className="font-semibold">
              {voucher.value.toLocaleString("vi-VN")}đ
            </span>
          )}
          {voucher.type === "percentage" && voucher.maxDiscountAmount && (
            <div className="text-xs text-gray-500">
              Tối đa: {voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ
            </div>
          )}
        </td>
        <td className="p-3 border">
          {voucher.minOrderAmount > 0 ? (
            <span>{voucher.minOrderAmount.toLocaleString("vi-VN")}đ</span>
          ) : (
            <span className="text-gray-400">Không có</span>
          )}
        </td>
        <td className="p-3 border">
          <span className="font-semibold">{voucher.used || 0}</span>
          {voucher.usageLimit !== null && (
            <span className="text-gray-500"> / {voucher.usageLimit}</span>
          )}
        </td>
        <td className="p-3 border text-sm">
          {moment(voucher.startDate).format("DD/MM/YYYY HH:mm")}
        </td>
        <td className="p-3 border text-sm">
          {moment(voucher.endDate).format("DD/MM/YYYY HH:mm")}
        </td>
        <td className="p-3 border">{getStatusTag()}</td>
        <td className="p-3 border">
          <div className="flex items-center justify-center gap-2">
            <span
              onClick={() => editVoucher(voucher)}
              className="cursor-pointer hover:bg-blue-100 rounded-lg p-2 transition"
              title="Sửa"
            >
              <svg
                className="w-5 h-5 fill-current text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <Popconfirm
              title="Bạn có chắc muốn xóa voucher này?"
              onConfirm={() => deleteVoucher(voucher._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <span
                className="cursor-pointer hover:bg-red-100 rounded-lg p-2 transition"
                title="Xóa"
              >
                <svg
                  className="w-5 h-5 fill-current text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Popconfirm>
          </div>
        </td>
      </tr>
    </Fragment>
  );
};

export default AllVouchers;

