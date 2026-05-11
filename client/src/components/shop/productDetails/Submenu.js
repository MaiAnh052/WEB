import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Submenu = (props) => {
  const { categoryId, category, product } = props.value;
  const history = useHistory();

  const breadcrumbItems = [
    {
      title: (
        <span onClick={() => history.push("/")} style={{ cursor: "pointer" }}>
          <HomeOutlined /> Trang chủ
        </span>
      ),
    },
    {
      title: (
        <span
          onClick={() => history.push(`/products/category/${categoryId}`)}
          style={{ cursor: "pointer" }}
        >
          {category}
        </span>
      ),
    },
    {
      title: <span>{product}</span>,
    },
  ];

  return (
    <Fragment>
      <section
        style={{
          background: "#fafafa",
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </section>
    </Fragment>
  );
};

export default Submenu;
