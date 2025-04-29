"use client";
import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React from "react";

const Error = () => {
  return (
    <PageNotFound
      returnLable={"Go Back"}
      returnLink={"/learner"}
      errorMessage={
        "Currently this service is getting some error. Please try again later."
      }
    />
  );
};

export default Error;
