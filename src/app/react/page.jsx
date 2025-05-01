"use client";

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom';

async function submitForm(data) {
    console.log("FormValues===>", data)
    return await new Promise((res, rej) => setTimeout(() => {
        res(data)
    }, 13000))
}

function Status() {
    const { pending, data, method, action } = useFormStatus();
    console.log(pending, data?.get("name"))
    return <p>{pending ? 'Loading...' : "Loaded"}</p>
}

function FormAction() {
    const [state, formAction] = useActionState(submitForm)
    const { pending } = useFormStatus();
    return (
        <div className='p-6'>
            <h1 >FormAction</h1>
            <form action={formAction} className='mt-4'>
                <input className='border-2 border-gray-400 rounded p-2 hover:text-cyan-500"' type="text" name="name" />
                <button className={"my-4 border-2 border-gray-400 rounded p-2 hover:text-cyan-500"} type="submit" disabled={pending}>Update</button>
                <Status />
            </form>

        </div>
    )
}

export default FormAction