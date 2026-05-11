import React, { Fragment, useContext, useState, useEffect } from "react";
import { VoucherContext } from "./index";
import { updateVoucher, getAllVouchers } from "./FetchApi";
import { Input, Select, InputNumber, DatePicker, message } from "antd";
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;

const EditVoucherModal = (props) => {
  const { data, dispatch } = useContext(VoucherContext);

  const [fData, setFdata] = useState({
    vId: null,
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: null,
    startDate: null,
    endDate: null,
    status: "active",
  });

  useEffect(() => {
    if (data.editVoucherModal.voucher) {
      const voucher = data.editVoucherModal.voucher;
      setFdata({
        vId: voucher._id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || "",
        type: voucher.type,
        value: voucher.value,
        minOrderAmount: voucher.minOrderAmount || 0,
        maxDiscountAmount: voucher.maxDiscountAmount || null,
        usageLimit: voucher.usageLimit || null,
        startDate: voucher.startDate ? moment(voucher.startDate) : null,
        endDate: voucher.endDate ? moment(voucher.endDate) : null,
        status: voucher.status,
      });
    }
  }, [data.editVoucherModal.modal, data.editVoucherModal.voucher]);

  const fetchData = async () => {
    let responseData = await getAllVouchers();
    if (responseData && responseData.vouchers) {
      dispatch({
        type: "fetchVoucherAndChangeState",
        payload: responseData.vouchers,
      });
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    dispatch({ type: "loading", payload: true });

    // Validation
    if (!fData.code || !fData.name || !fData.startDate || !fData.endDate) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      dispatch({ type: "loading", payload: false });
      return;
    }

    if (fData.type === "percentage" && (fData.value < 0 || fData.value > 100)) {
      message.error("Phần trăm giảm giá phải từ 0 đến 100");
      dispatch({ type: "loading", payload: false });
      return;
    }

    if (fData.type === "fixed" && fData.value <= 0) {
      message.error("Số tiền giảm phải lớn hơn 0");
      dispatch({ type: "loading", payload: false });
      return;
    }

    if (fData.startDate && fData.endDate && fData.startDate >= fData.endDate) {
      message.error("Ngày kết thúc phải sau ngày bắt đầu");
      dispatch({ type: "loading", payload: false });
      return;
    }

    try {
      const voucherData = {
        vId: fData.vId,
        code: fData.code.toUpperCase(),
        name: fData.name,
        description: fData.description || "",
        type: fData.type,
        value: fData.value,
        minOrderAmount: fData.minOrderAmount || 0,
        maxDiscountAmount: fData.maxDiscountAmount || null,
        usageLimit: fData.usageLimit || null,
        startDate: fData.startDate ? fData.startDate.toISOString() : null,
        endDate: fData.endDate ? fData.endDate.toISOString() : null,
        status: fData.status,
      };

      let responseData = await updateVoucher(voucherData);
      if (responseData.success) {
        message.success(responseData.message || "Cập nhật voucher thành công");
        fetchData();
        dispatch({ type: "editVoucherModalClose" });
      } else if (responseData.error) {
        message.error(responseData.error);
      }
      dispatch({ type: "loading", payload: false });
    } catch (error) {
      console.log(error);
      message.error("Có lỗi xảy ra khi cập nhật voucher");
      dispatch({ type: "loading", payload: false });
    }
  };

  return (
    <Fragment>
      {/* Black Overlay */}
      <div
        onClick={(e) => dispatch({ type: "editVoucherModalClose" })}
        className={`${
          data.editVoucherModal.modal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />

      {/* Modal */}
      <div
        className={`${
          data.editVoucherModal.modal ? "" : "hidden"
        } fixed inset-0 m-4 flex items-center z-30 justify-center overflow-y-auto`}
      >
        <div className="relative bg-white w-full md:w-3/4 lg:w-2/3 shadow-lg flex flex-col items-center space-y-4 overflow-y-auto px-4 py-6 md:px-8 rounded-lg max-h-[90vh]">
          <div className="flex items-center justify-between w-full pt-4 border-b pb-4">
            <span className="text-left font-semibold text-2xl tracking-wider">
              Sửa Voucher
            </span>
            <span
              style={{ background: "#303031" }}
              onClick={(e) => dispatch({ type: "editVoucherModalClose" })}
              className="cursor-pointer text-gray-100 py-2 px-2 rounded-full hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <form className="w-full space-y-4" onSubmit={(e) => submitForm(e)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="code" className="font-semibold">
                  Mã Voucher <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: SALE50"
                  value={fData.code}
                  onChange={(e) =>
                    setFdata({
                      ...fData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="name" className="font-semibold">
                  Tên Voucher <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Giảm 50% cho đơn hàng"
                  value={fData.name}
                  onChange={(e) =>
                    setFdata({ ...fData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="description" className="font-semibold">
                Mô tả
              </label>
              <TextArea
                rows={3}
                placeholder="Mô tả về voucher..."
                value={fData.description}
                onChange={(e) =>
                  setFdata({ ...fData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="type" className="font-semibold">
                  Loại giảm giá <span className="text-red-500">*</span>
                </label>
                <Select
                  value={fData.type}
                  onChange={(value) =>
                    setFdata({ ...fData, type: value, value: 0 })
                  }
                >
                  <Option value="percentage">Giảm theo %</Option>
                  <Option value="fixed">Giảm giá cố định</Option>
                </Select>
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="value" className="font-semibold">
                  Giá trị <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={fData.type === "percentage" ? 100 : undefined}
                  value={fData.value}
                  onChange={(value) => setFdata({ ...fData, value: value || 0 })}
                  formatter={
                    fData.type === "percentage"
                      ? (value) => `${value}%`
                      : (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={
                    fData.type === "percentage"
                      ? (value) => value.replace("%", "")
                      : (value) => value.replace(/\$\s?|(,*)/g, "")
                  }
                />
              </div>

              {fData.type === "percentage" && (
                <div className="flex flex-col space-y-1">
                  <label htmlFor="maxDiscountAmount" className="font-semibold">
                    Giảm tối đa (đ)
                  </label>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    value={fData.maxDiscountAmount}
                    onChange={(value) =>
                      setFdata({ ...fData, maxDiscountAmount: value })
                    }
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="minOrderAmount" className="font-semibold">
                  Đơn hàng tối thiểu (đ)
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={fData.minOrderAmount}
                  onChange={(value) =>
                    setFdata({ ...fData, minOrderAmount: value || 0 })
                  }
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="usageLimit" className="font-semibold">
                  Số lượt sử dụng tối đa
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={fData.usageLimit}
                  onChange={(value) =>
                    setFdata({ ...fData, usageLimit: value })
                  }
                  placeholder="Để trống = không giới hạn"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="startDate" className="font-semibold">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  value={fData.startDate}
                  onChange={(date) => setFdata({ ...fData, startDate: date })}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="endDate" className="font-semibold">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  value={fData.endDate}
                  onChange={(date) => setFdata({ ...fData, endDate: date })}
                  disabledDate={(current) =>
                    current &&
                    fData.startDate &&
                    current < fData.startDate
                  }
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="status" className="font-semibold">
                Trạng thái
              </label>
              <Select
                value={fData.status}
                onChange={(value) => setFdata({ ...fData, status: value })}
              >
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Tạm dừng</Option>
              </Select>
            </div>

            <div className="flex flex-col space-y-1 w-full pb-4 md:pb-6 mt-6">
              <button
                style={{ background: "#303031" }}
                type="submit"
                className="bg-gray-800 text-gray-100 rounded-full text-lg font-medium py-3 hover:bg-gray-700 transition"
              >
                Cập nhật Voucher
              </button>
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default EditVoucherModal;

