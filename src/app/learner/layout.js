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

const flexGrow = {
  flexGrow: 1,
  flexShrink: 1,
  overflowX: "auto",
  padding: "2rem 0",
};

const Layout = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={style}>
        <TrainingSidebar />
        <div style={flexGrow}>{children}</div>
      </div>
    </QueryClientProvider>
  );
};

export default Layout;
