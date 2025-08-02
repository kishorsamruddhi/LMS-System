import { backendLink, cookiesKey } from '@/utils/token'
import { cookies } from 'next/headers'
import React, { Fragment } from 'react'
import UpdateCourse from './_Action'

const Page = async ({ params }) => {
    try {
        const { course_id } = await params
        const ck = (await cookies())?.get(cookiesKey)?.value
        const reqUrl = backendLink + "admin/get/course/" + course_id
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
        // const { course_name, business_id, color, course_desc, course_status, modules, updatedAt } = resp.data
        return (<Fragment>
            <UpdateCourse formValues={resp.data} />
        </Fragment>
        );

    }
    catch (error) {
        return <h1>
            {error.message}
        </h1>
    }
}

export default Page