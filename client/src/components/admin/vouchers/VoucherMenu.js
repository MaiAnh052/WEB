import React, { useContext } from "react";
import { VoucherContext } from "./index";

const VoucherMenu = () => {
  const { data, dispatch } = useContext(VoucherContext);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h2>
        <button
          onClick={() => dispatch({ type: "addVoucherModal", payload: true })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
        >
          + Thêm Voucher
        </button>
      </div>
    </div>
  );
};

export default VoucherMenu;

