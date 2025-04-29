"use client";
import LoadingSpinner from "@/components/Loading";
import { UserContext } from "@/store/User_Context";
import { redirect } from "next/navigation";
import { use, useEffect } from "react";

const Layout = ({ children }) => {
    const { auth, isAuhtLoading } = use(UserContext)
    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            const user = auth?.role || null
            if (user) {
                const role = auth.role === "admin" ? "/admin" : "/learner"
                redirect(role)
            }
        }
    }, [isAuhtLoading])
    if (isAuhtLoading) return <LoadingSpinner />
    return (
        <div>{children}</div>
    );
};
export default Layout;
