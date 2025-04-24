"use client";
import React from 'react'
import { useForm } from 'react-hook-form';
const Page = () => {
    return (
        <div className='p-6'>
            <UserAddToInstitue />
        </div>
    )
}

const UserAddToInstitue = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return <div>
        <h1 className='mx-auto text-cyan-600 text-2xl w-fit mb-6'>Join Institue</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div >
                <label className="block text-sm font-medium text-gray-700">Paste the Invitation token of the institue <span className='text-gray-400'>(Check Email)</span></label>
                <input
                    type="text"
                    {...register('invitationToken', { required: 'Invitation Token is required' })}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.invitationToken ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.invitationToken && <p className="text-red-500 text-sm">{errors.invitationToken.message}</p>}
            </div>
            <button
                type="submit"
                className="mt-4 w-fit px-12 bg-cyan-600 text-white font-semibold py-2 rounded-md hover:bg-cyan-700"
            >
                Submit
            </button>
        </form>
    </div>

}

export default Page