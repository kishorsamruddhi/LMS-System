"use client"

import ErrorPage from "@/components/ErrorPage"

const Error = ({ error }) => {
    return (
        <ErrorPage message={error.message} />
    )
}

export default Error