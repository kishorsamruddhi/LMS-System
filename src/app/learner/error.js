"use client";

import PageNotFound from "@/components/PageNotFound/PageNotFound";

export default function Error({ error }) {
  return (
    <PageNotFound
      returnLink={"/learner"}
      returnLable={"Go Back"}
      errorMessage={error?.message}
    ></PageNotFound>
  );
}
