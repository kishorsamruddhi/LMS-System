"use client";
import { setupUserApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import useUserContext from '@/store/User_Context';
import { Loader } from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Page = () => {
    const { isAuhtLoading, auth, signInHandler } = useUserContext()
    const [loading, setLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();


    useEffect(() => {
        if (!isAuhtLoading && auth?.role) {
            if (auth?.business_course_id) {
                toast.info("Already connected to a Institute. Redirecting...")
                setTimeout(() => {
                    redirect("/learner")
                }, 1200);
            }
        }
    }, [isAuhtLoading])

    async function onSubmit(data) {
        try {
            if (loading) return
            setLoading(true)
            const resp = await setupUserApi(data)
            if (resp?.error || !resp.token) {
                throw new Error(resp?.data || "Server Error")
            }
            else {
                const message = "Joinned " + resp?.Institute?.name || resp.data
                toast.success(message)
                signInHandler(resp.userData, resp.token)
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
            <h1 className='mx-auto text-cyan-600 text-2xl w-fit mb-6'>Join institute</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div >
                    <label className="block text-sm font-medium text-gray-700">Paste the Invitation token of the institute <span className='text-gray-400'>(Check Email)</span></label>
                    <input
                        type="text"
                        {...register('invitationToken', { required: 'Invitation Token is required' })}
                        className={`mt-1 block w-full border rounded-md p-2 ${errors.invitationToken ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.invitationToken && <p className="text-red-500 text-sm">{errors.invitationToken.message}</p>}
                </div>
                <Button
                    disabled={loading}
                    type="submit"
                    className="mt-4 w-fit px-12 bg-cyan-600 text-white font-semibold py-2 rounded-md hover:bg-cyan-700"
                >
                    {loading ? <Fragment>
                        <Loader />
                        Submitting...
                    </Fragment>
                        : "Submit"
                    }
                </Button>
            </form>
        </div>
    )
}

export default Page