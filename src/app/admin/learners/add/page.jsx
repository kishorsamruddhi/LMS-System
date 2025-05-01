"use client";
import { sendInvitationApi } from '@/api/auth';
import AdminBackButton from '@/components/AdminBackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Validations from '@/utils/FormValidations';
import { ClipboardCopy, Loader } from 'lucide-react';
import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Page = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await sendInvitationApi(data);
            if (response?.error) {
                throw new Error(response?.data || "Something went wrong!!!")
            }
            if (response?.token) {
                setResult({ email: data.email, token: response.token })
            }
            toast.success('Invitation sent successfully!');
        } catch (error) {
            toast.error(error?.message || 'An error occurred while sending the invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    function copyToken() {
        navigator.clipboard.writeText(result?.token || "")
            .then(() => {
                toast.success("Token copied to clipboard.")
            })
            .catch(err => {
                toast.error('Failed to copy: ', err.message);
            });
    }

    return (
        <div className='p-6'>
            <Card className={"mx-auto max-w-[600px]"}>
                <CardContent>
                    <div className="flex gap-4">
                        <AdminBackButton addOnPath='/learners' />
                        <h1 className='mx-auto text-cyan-600 text-2xl w-fit mb-6'>Send Invitation</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-md font-bold text-gray-700">
                                Enter User Email <span className='text-sm font-normal text-gray-400'>(An invitation token will be sent to the user's email for joining the institute.)</span>
                            </label>
                            <input
                                type="email"
                                {...register('email', Validations.email)}
                                className={`mt-1 block w-full border rounded-md p-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                aria-invalid={errors.email ? "true" : "false"}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm" aria-live="assertive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`mt-4 w-fit px-12 ${isLoading ? 'bg-gray-400' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-semibold py-2 rounded-md`}
                        >
                            {isLoading ?
                                <Fragment><Loader /> Sending... </Fragment>
                                : 'Send Code'}
                        </Button>
                    </form>
                </CardContent>
                {result?.email && <CardFooter>
                    <div className="flex flex-col w-full">
                        <h3>Token Vaild for:</h3>
                        <div className="mt-2">
                            <label className='text-sm'>Email:</label>
                            <Input readOnly disabled={true} type="text" value={result.email} />
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between">
                                <label className='text-sm flex mb-2'>Token: </label>
                                <ClipboardCopy onClick={copyToken} className='text-sm' />
                            </div>
                            <Textarea disabled={true} readOnly className={"w-full"} value={result.token} />
                        </div>
                    </div>
                </CardFooter>}
            </Card>
        </div>
    );
};

export default Page;
