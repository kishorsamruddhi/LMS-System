"use client";
import LoadingSpinner from "@/components/Loading";
import TrainingSidebar from "@/components/Sidebar/TrainingSidebar";
import { UserContext } from "@/store/User_Context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { redirect, usePathname } from "next/navigation";
import React, { use, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      staleTime: 60 * 1000,
    },
  },
});

const style = {
  backgroundColor: "#fff",
  color: "#000",
  minHeight: "calc(100vh - var(--header-h, 60px))",
  display: "flex",
  position: "relative",
};

const flexGrow = {
  flexGrow: 1,
};

const Layout = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <IsUser>{children}</IsUser>
    </QueryClientProvider>
  );
};

function IsUser({ children }) {
  const { auth, isAuhtLoading } = use(UserContext);
  const pathname = usePathname();
  useEffect(() => {
    if (!isAuhtLoading) {
      const role = auth.role;
      const isVerified = auth.isEmailVerified;
      if (role === "user") {
        if (!isVerified && !pathname.includes("email-verify")) {
          redirect("/learner/email-verify");
        } else if (
          !auth?.business_course_id &&
          pathname.includes("get-started")
        ) {
          redirect("/learner/get-started");
        }
        return;
      } else {
        redirect("/page404");
      }
    }
  }, [isAuhtLoading]);

  if (isAuhtLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={style}>
      {auth?.isEmailVerified && <TrainingSidebar />}
      <div style={flexGrow}>{children}</div>
    </div>
  );
}

export default Layout;
