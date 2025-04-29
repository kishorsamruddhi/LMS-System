"use client";
import { setupAdminApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/store/User_Context';
import { Loader } from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { Fragment, use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Page = () => {
    const { isAuhtLoading, auth, signInHandler } = use(UserContext)
    const [isLoading, setLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            if (auth?.business_course_id) {
                toast.info("Already Have an Institute. Redirecting...")
                setTimeout(() => {
                    redirect("/admin")
                }, 1200);
            }
        }
    }, [isAuhtLoading])


    const onSubmit = async (data) => {
        if (isLoading) return
        setLoading(true)
        try {
            const resp = await setupAdminApi(data);
            if (resp?.error || !resp.token) {
                throw new Error(resp?.data || "Server Error")
            }
            else {
                toast.success("Institute Setup Successfully")
                signInHandler(resp.data, resp.token)
            }
        } catch (error) {
            toast.error(error.message)
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div className='p-6'>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-sm:block grid grid-cols-2 gap-2">
                <h1 style={{ gridColumn: "1/-1" }} className='mx-auto text-cyan-600 text-2xl w-fit mb-6'>Get Started with institute</h1>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                        type="text"
                        id='business_name'
                        {...register('business_name', { required: 'Business name is required' })}
                        className={`mt-1 block w-full border rounded-md p-2 ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.business_name && <p className="text-red-500 text-sm">{errors.business_name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        id='category'
                        type="text"
                        {...register('category', { required: 'Category is required' })}
                        className={`mt-1 block w-full border rounded-md p-2 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                    <label className="block text-sm font-medium text-gray-700">Business Description</label>
                    <textarea
                        id='business_desc'
                        {...register('business_desc', { required: 'Business description is required' })}
                        className={`mt-1 block w-full border rounded-md p-2 ${errors.business_desc ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.business_desc && <p className="text-red-500 text-sm">{errors.business_desc.message}</p>}
                </div>
                <div style={{ gridColumn: "1/-1" }} className='flex justify-center'>
                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="mt-4 w-fit px-12 bg-cyan-600 text-white font-semibold py-2 rounded-md hover:bg-cyan-700" >
                        {isLoading ? <Fragment>
                            <Loader />
                            Loading...
                        </Fragment>
                            : "Submit"
                        }

                    </Button>
                </div>
            </form>
        </div>
    )
}

export default Page