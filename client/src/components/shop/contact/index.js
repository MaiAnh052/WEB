import React, { Fragment } from "react";
import Layout from "../layout";
import Contact from "./Contact";

const ContactIndex = () => {
  return (
    <Fragment>
      <Layout children={<Contact />} />
    </Fragment>
  );
};

export default ContactIndex;
