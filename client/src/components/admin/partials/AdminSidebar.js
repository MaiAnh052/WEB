import React, { Fragment } from "react";
import { useLocation, useHistory } from "react-router-dom";

const AdminSidebar = (props) => {
  const location = useLocation();
  const history = useHistory();

  return (
    <Fragment>
      <div
        id="sidebar"
        className="hidden md:block sticky top-0 left-0 h-screen md:w-3/12 lg:w-2/12 bg-white border-r border-gray-200"
      >
        <div
          onClick={(e) => history.push("/admin/dashboard")}
          className={`${
            location.pathname === "/admin/dashboard"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Dashboard</span>
        </div>
        <div
          onClick={(e) => history.push("/admin/dashboard/categories")}
          className={`${
            location.pathname === "/admin/dashboard/categories"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Categories</span>
        </div>
        <div
          onClick={(e) => history.push("/admin/dashboard/products")}
          className={`${
            location.pathname === "/admin/dashboard/products"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Products</span>
        </div>
        <div
          onClick={(e) => history.push("/admin/dashboard/orders")}
          className={`${
            location.pathname === "/admin/dashboard/orders"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Orders</span>
        </div>
        <div
          onClick={(e) => history.push("/admin/dashboard/vouchers")}
          className={`${
            location.pathname === "/admin/dashboard/vouchers"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Vouchers</span>
        </div>
        <div
          onClick={(e) => history.push("/admin/dashboard/inventory")}
          className={`${
            location.pathname === "/admin/dashboard/inventory"
              ? "bg-gray-50 border-r-2 border-gray-900 text-gray-900"
              : "text-gray-600 hover:bg-gray-50"
          } cursor-pointer flex flex-col items-center justify-center py-3 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="mt-1 text-xs font-medium">Kho hàng</span>
        </div>
      </div>
    </Fragment>
  );
};

export default AdminSidebar;
