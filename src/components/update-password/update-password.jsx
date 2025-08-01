"use client"
import { toast, ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import PasswordInput from "../PasswordInput";
import { useForm } from "react-hook-form";
import { updatePassword } from "@/api/auth";

export default function UpdatePassword() {
    const [isLoading, setIsLoading] = useState(false)
    const { register, formState: { errors }, handleSubmit, reset } = useForm()

    async function submitForm(data) {
        try {
            const { password, new_password } = data
            if (isLoading) return
            if (password === new_password) return
            setIsLoading(true)
            const res = await updatePassword({ password, new_password })
            if (res.error) {
                throw new Error(res.data)
            }
            toast.success(res.data || "updated")
            reset()
        } catch (error) {
            toast.error(error.message)
        }

        finally {
            setIsLoading(false)
        }
    }


    const btnContent = isLoading ? <Fragment>
        <Loader />  Verifying...
    </Fragment> : "Update Password"
    return (
        <div className="p-6 w-full">
            <h3 className="text-2xl text-center mb-3 text-cyan-600 font-bold">Update Password</h3>
            <form
                onSubmit={handleSubmit(submitForm)}
                defaultValue="send" className="mx-auto max-w-[400px]">
                <Card>
                    <CardContent className="space-y-2">
                        <Label htmlFor="token">Current Password</Label>
                        <PasswordInput type="text"
                            id="token"
                            register={register}
                            placeholder="Write your verify code here..."
                        />
                        {errors.password && <small className="text-red-500">{errors.password.message}</small>}
                        <Label className={"mt-4"} htmlFor="token">New Password</Label>
                        <PasswordInput type="text"
                            registerKey="new_password"
                            id="new_password"
                            register={register}
                            placeholder="Write your verify code here..."
                        />
                        {errors.new_password && <small className="text-red-500">{errors.new_password.message}</small>}
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isLoading}>
                            {btnContent}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
