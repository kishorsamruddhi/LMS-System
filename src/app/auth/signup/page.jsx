"use client";

import { createAccountApi } from '@/api/auth';
import PasswordInput from '@/components/PasswordInput';
import Dropdown from '@/components/Prime/Dropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserContext } from '@/store/User_Context';
import Validations from '@/utils/FormValidations';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { Fragment, use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const SignUp = () => {
  const { isAuhtLoading, auth, signInHandler } = use(UserContext)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuhtLoading && auth?.role) {
      if (auth.role == "admin") {
        toast.info("Already Logged-In. Redirecting...")
        setTimeout(() => {
          redirect("/admin")
        }, 1200);
      }
      else if (auth?.role == "user") {
        toast.info("Already Logged-In. Redirecting...")
        setTimeout(() => {
          redirect("/learner")
        }, 1200);
      }
    }
  }, [isAuhtLoading])

  const onSubmit = async (data) => {
    try {
      if (isLoading) return
      setIsLoading(true)
      const resp = await createAccountApi(data)
      if (resp?.error || !resp.token) {
        throw new Error(resp?.data || "Server Error")
      }
      else {
        toast.success("Account Created")
        signInHandler(resp.data, resp.token)
      }
    } catch (error) {
      toast.error(error.message)
    }
    finally {
      setIsLoading(false)
    }
  };

  function selectUserType(val) {
    setValue("role", val)
  }

  const FormField = ({ label, type, registerKey, placeholder = "", options = { required: true }, inputStyle = {} }) => {
    return (
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-600">{label}</label>
        <Input
          disabled={isLoading}
          type={type}
          style={inputStyle}
          placeholder={placeholder}
          className={`mt-1 block w-full border ${errors[registerKey] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring focus:ring-blue-500`}
          {...register(registerKey, options)}
        />
        {errors[registerKey] && <span className="text-sm text-red-400 mt-1">{errors[registerKey]?.message || "This field is required"}</span>}
      </div>
    );
  };

  return (
    <div className="flex pt-4 px-6 items-center justify-center min-h-[calc(100dvh_-_72px)] bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {FormField({ register, errors, label: "Username", type: "text", registerKey: "username", options: Validations.firstName })}
        {FormField({ register, errors, label: "Email", type: "email", registerKey: "email", options: Validations.email, placeholder: "example@gmail.com" })}
        {FormField({ register, errors, label: "Phone Number (optional)", type: "number", registerKey: "phoneNumber", options: Validations.phoneNumber, placeholder: "9876543210" })}
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
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600"
        >
          {isLoading ? <Fragment>
            <Loader />
            Creating Account...
          </Fragment>
            : "Create Account"
          }
        </Button>
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
