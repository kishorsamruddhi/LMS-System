"use client";

import { Input } from '@/components/ui/input';
import React from 'react';
import { useForm } from 'react-hook-form';

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission (e.g., send data to your API)
  };

  return (
    <div className="flex pt-4 px-6 items-center justify-center min-h-[calc(100dvh_-_72px)] bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <Input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <Input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">User Type</label>
          <select
            {...register('userType', { required: 'User type is required' })}
            className={`mt-1 block w-full border ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          >
            <option value="">Select User Type</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
