import React, { Fragment } from "react";
import Layout from "../layout";
import Blog from "./Blog";

const BlogIndex = () => {
  return (
    <Fragment>
      <Layout children={<Blog />} />
    </Fragment>
  );
};

export default BlogIndex;
