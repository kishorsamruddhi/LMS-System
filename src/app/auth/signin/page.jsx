"use client";

import { loginApi } from "@/api/auth";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useUserContext from "@/store/User_Context";
import { Github, Loader, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


const SignInPage = () => {
  const { auth, isAuhtLoading, signInHandler } = useUserContext()
  const [loading, setLoading] = useState(false)
  const { register, setValue, handleSubmit, formState: { errors }, } = useForm();

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

  const handleSignInWithEmail = async ({ password, email }) => {
    try {
      if (loading) return
      setLoading(true)
      const resp = await loginApi({ password, email })
      if (resp?.error || !resp.token) {
        throw new Error(resp?.data || "Server Error")
      }
      else {
        toast.success("Logged-in")
        signInHandler(resp.data, resp.token)
      }
    } catch (error) {
      toast.error(error.message)
    }
    finally {
      setLoading(false)
    }
  };

  function testUserCredentials() {
    setValue("email", "testuser@gmail.com")
    setValue("password", "12345678")
  }

  const socialBtnClass = "border-2 border-gray-300 hover:border-cyan-300  flex items-center justify-center space-x-2 rounded"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-sm w-full space-y-8 p-6 bg-white border-rose-50 rounded-xl shadow-xl">
        <CardHeader>
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            Sign In
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => signIn("google")}
                className={socialBtnClass}
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => signIn("github")}
                className={socialBtnClass}
              >
                <Github className="w-5 h-5" />
              </Button>

              <Button
                onClick={testUserCredentials}
                className={socialBtnClass}>Use guest creadentials</Button>
            </div>
            {/* 
            <div className="relative my-4">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">Or</span>
              </div>
            </div> */}

            <form
              onSubmit={handleSubmit(handleSignInWithEmail)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  {...register('email', { required: 'Email is required' })}
                  className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <PasswordInput register={register} errors={errors} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <Button
                disabled={loading}
                className="w-full border-gray-300 border-2 mt-4">
                {loading ? <Fragment>
                  <Loader />
                  Loading...
                </Fragment>
                  : "Sign in"
                }
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
