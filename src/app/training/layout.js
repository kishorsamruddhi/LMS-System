"use client";

import TrainingSidebar from "@/components/Sidebar/TrainingSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

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
const headerstyle = {
  backgroundColor: "#fff",
  height: "60px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};
const flexGrow = {
  flexGrow: 1,
};

const Layout = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={headerstyle} className="header">
        <h1>Hello Kartik</h1>
      </div>
      <div style={style}>
        <TrainingSidebar />
        <div style={flexGrow}>{children}</div>
      </div>
    </QueryClientProvider>
  );
};

export default Layout;
