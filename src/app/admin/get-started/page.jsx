"use client";
import React from 'react'
import { useForm } from 'react-hook-form';
import Validations from '@/utils/FormValidations';

const Page = () => {
    return (
        <div className='p-6'>
            <BusinessForm />
        </div>
    )
}

const BusinessForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-sm:block grid grid-cols-2 gap-2">
            <h1 style={{ gridColumn: "1/-1" }} className='mx-auto text-cyan-600 text-2xl w-fit mb-6'>Get Started with Institue</h1>
            <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                    type="text"
                    {...register('business_name', { required: 'Business name is required' })}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.business_name && <p className="text-red-500 text-sm">{errors.business_name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    {...register('email', Validations.email)}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                    type="text"
                    {...register('phone', { required: 'Phone number is required' })}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                    type="text"
                    {...register('category', { required: 'Category is required' })}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div style={{ gridColumn: "1/-1" }}>
                <label className="block text-sm font-medium text-gray-700">Business Description</label>
                <textarea
                    {...register('business_desc', { required: 'Business description is required' })}
                    className={`mt-1 block w-full border rounded-md p-2 ${errors.business_desc ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.business_desc && <p className="text-red-500 text-sm">{errors.business_desc.message}</p>}
            </div>
            <div style={{ gridColumn: "1/-1" }} className='flex justify-center'>
                <button
                    type="submit"
                    className="mt-4 w-fit px-12 bg-cyan-600 text-white font-semibold py-2 rounded-md hover:bg-cyan-700"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};


export default Page