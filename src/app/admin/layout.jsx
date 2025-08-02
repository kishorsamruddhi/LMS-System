"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Fragment } from 'react'

const queryClient = new QueryClient();
const Layout = ({ children }) => {
    return (<Fragment>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Fragment>
    )
}

export default Layout