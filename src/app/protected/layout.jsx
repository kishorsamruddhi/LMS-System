"use client"
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children, session }) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    );
}
