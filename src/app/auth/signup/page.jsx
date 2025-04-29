"use client";

import PasswordInput from '@/components/PasswordInput';
import Dropdown from '@/components/Prime/Dropdown';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';

const SignUp = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission (e.g., send data to your API)
  };

  function selectUserType(val) {
    setValue("userType", val)
  }

  return (
    <div className="flex pt-4 px-6 items-center justify-center min-h-[calc(100dvh_-_72px)] bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Username</label>
          <Input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <Input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <PasswordInput register={register} errors={errors} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Account Type</label>
          <Dropdown placeholder='Select User Type'
            triggerClass='w-[200px]'
            contentProps={{ className: 'bg-white w-[200px]' }}
            optionLabel={"text"} optionValue={"value"}
            options={[{ value: "admin", text: "Admin" }, { value: "user", text: "User" }]}
            onChange={selectUserType}
          />
          {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
        <p className='mt-4 text-gray-500 text-sm'>
          Already have a account?{" "}
          <Link href="/auth/signin" className="text-blue-500  hover:underline">
            Sign In
          </Link>
        </p>
      </form>

    </div>
  );
};

export default SignUp;
