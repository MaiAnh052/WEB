import React, { Fragment } from "react";
import AdminLayout from "../layout";
import AllInventory from "./AllInventory";
import { InventoryContextProvider, InventoryContext } from "./InventoryContext";

const InventoryComponent = () => {
  return (
    <InventoryContextProvider>
      <AllInventory />
    </InventoryContextProvider>
  );
};

const Inventory = (props) => {
  return (
    <Fragment>
      <AdminLayout children={<InventoryComponent />} />
    </Fragment>
  );
};

export default Inventory;
export { InventoryContext };

