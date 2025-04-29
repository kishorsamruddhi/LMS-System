"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminBackButton from "@/components/AdminBackButton";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Prime/Dropdown";
import { Textarea } from "@/components/ui/textarea"
import { createAdminCourse } from "@/api/_admin/createApi";

const CreateCourse = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            course_status: ""
        }
    });


    async function onSubmit(data) {
        const { course_code, course_name, course_desc, color, course_status } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await createAdminCourse({ course_code, course_name, course_desc, color, course_status });
            if (!resp.error) {
                toast.success(`Course created successfully!!!`);
                setTimeout(() => {
                    redirect("/admin/courses");
                }, 1200);
            } else {
                toast.error(resp?.data || "Unknown Error");
                setTimeout(() => {
                    throw new Error(resp?.data || "Unknown Error")
                }, 1200);
            }
        } catch (error) {
            toast.error(error.message);
            setTimeout(() => {
                throw new Error(error.message)
            }, 1200);
        }
        finally {
            setIsLoading(false)
        }
    }

    const FormField = ({ label, type, registerKey, options = { required: true }, inputStyle = {} }) => {
        return (
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">{label}</label>
                <Input
                    disabled={isLoading}
                    type={type}
                    style={inputStyle}
                    {...register(registerKey, options)}
                />
                {errors[registerKey] && <span className="text-sm text-red-400">{errors[registerKey]?.message || "This field is required"}</span>}
            </div>
        );
    };

    function statusChange(val) {
        setValue("course_status", val)
    }

    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} onSubmit={handleSubmit(onSubmit)}>
            <div className="my-4 flex gap-4 items-center">
                <AdminBackButton addOnPath="/courses" />
                <h1 className="text-2xl">Create <span className="text-cyan-500">Course</span> </h1>
            </div>
            {FormField({ register: register, errors: errors, label: "Course Code:", type: "text", registerKey: "course_code" })}
            {FormField({ register: register, errors: errors, label: "Course Name:", type: "text", registerKey: "course_name" })}
            {/* <FormField register={register} errors={errors} label={"Course Sequence:"} type="number" registerKey={"course_seq_no"} /> */}
            <div className="flex gap-4">
                {FormField({ register: register, errors: errors, label: "Color:", type: "color", registerKey: "color", inputStyle: { width: "100px" } })}
                <div className="flex flex-col  mt-4">
                    <label className="text-sm text-gray-600">Course Status:</label>
                    <Dropdown options={["ACTIVE", "INACTIVE"]}
                        onChange={statusChange}
                        disabled={isLoading}
                        placeholder="Select Status"
                    />
                    {errors.course_status && <span className="text-sm text-red-400">This field is required</span>}
                </div>
            </div>
            <div className="flex flex-col  mt-4">
                <label className="text-sm text-gray-600">Course Description:</label>
                <Textarea
                    disabled={isLoading}
                    placeholder="Type your message here." {...register("course_desc", { required: true })} />
                {errors?.course_desc && <span className="text-sm text-red-400">{errors?.course_desc?.message || "This field is required"}</span>}
            </div>
            {/* <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} /> */}
            <div className="mt-4">
                <Button className={"hover:text-cyan-400"} disabled={isLoading} type="submit">
                    {isLoading ? <>
                        <Loader />
                        <span className="ml-2">
                            Creating Course
                        </span>
                    </>
                        : "Create Course"}
                </Button>
            </div>
        </form>
    );
};

export default CreateCourse;
