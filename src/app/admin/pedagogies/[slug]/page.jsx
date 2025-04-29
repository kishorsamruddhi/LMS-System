import { backendLink, cookiesKey } from '@/utils/token'
import { cookies } from 'next/headers'
import React from 'react'
import Actions from './_Action'

const Page = async ({ params }) => {
    try {
        const { slug } = await params
        const ck = (await cookies())?.get(cookiesKey)?.value
        const reqUrl = backendLink + "admin/get/pedagogy/" + slug
        const makingReq = await fetch(reqUrl, {
            headers: {
                Authorization: `Bearer ${ck}`,
            }
        })
        if (!makingReq.ok) {
            throw new Error(`HTTP error! status: ${makingReq.status}`);
        }
        const resp = await makingReq.json()

        if (resp.error) {
            throw new Error(resp.data);
        }
        return (
            <div>
                <Actions formValues={resp.data} />
            </div>
        );

    }
    catch (error) {
        return <h1>
            {error.message}
        </h1>
    }
}

export default Page