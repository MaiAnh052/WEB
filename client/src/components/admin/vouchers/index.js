import React, { Fragment, createContext, useReducer } from "react";
import AdminLayout from "../layout";
import VoucherMenu from "./VoucherMenu";
import AllVouchers from "./AllVouchers";
import AddVoucherModal from "./AddVoucherModal";
import EditVoucherModal from "./EditVoucherModal";
import { voucherState, voucherReducer } from "./VoucherContext";

/* This context manage all of the vouchers component's data */
export const VoucherContext = createContext();

const VoucherComponent = () => {
  return (
    <div className="grid grid-cols-1 space-y-4 p-4">
      <VoucherMenu />
      <AllVouchers />
      <AddVoucherModal />
      <EditVoucherModal />
    </div>
  );
};

const Vouchers = (props) => {
  const [data, dispatch] = useReducer(voucherReducer, voucherState);
  return (
    <Fragment>
      <VoucherContext.Provider value={{ data, dispatch }}>
        <AdminLayout children={<VoucherComponent />} />
      </VoucherContext.Provider>
    </Fragment>
  );
};

export default Vouchers;

