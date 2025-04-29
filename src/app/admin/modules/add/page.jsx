"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminBackButton from "@/components/AdminBackButton";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Prime/Dropdown";
import { Textarea } from "@/components/ui/textarea"
import { createAdminModule } from "@/api/_admin/createApi";
import { getAdmin_Course_List_DropDown } from "@/api/_admin/getApis";

const CreateModule = () => {
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseDropdown, setCourseDropdown] = useState(null)
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


    const getCoursesList = async () => {
        try {
            const course_resp = await getAdmin_Course_List_DropDown();
            if (!course_resp?.error) {
                const arr = course_resp.data
                setCourseDropdown(arr);
                if (arr[0]?._id) {
                    setSelectedCourse(arr[0]?._id)
                    setValue("course_id", arr[0]?._id)
                }
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(error.message);
        }
    };

    useEffect(() => {
        getCoursesList()
    }, [])


    async function onSubmit(data) {
        const { module_name, module_code, module_desc, module_type, course_id } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await createAdminModule({ module_name, module_code, module_desc, module_type, course_id });
            if (!resp.error) {
                toast.success(`Module created successfully!!!`);
                setTimeout(() => {
                    redirect("/admin/modules?course_id=" + course_id);
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

    function moduleTypeChangeHandler(val) {
        setValue("module_type", val)
    }

    function courseChangeHandler(val) {
        debugger
        setValue("course_id", val)
        setSelectedCourse(val)
    }


    return (
        <div style={{ padding: "2rem" }}>
            <div className="my-4 flex gap-4 items-center">
                <AdminBackButton addOnPath="/modules" />
                <h1 className="text-2xl">Create <span className="text-cyan-500">Module</span> </h1>
            </div>
            <form style={{ minWidth: "unset", maxWidth: "unset", }} onSubmit={handleSubmit(onSubmit)}>
                {courseDropdown && <div className="flex flex-col  mt-4">
                    <label className="text-sm text-gray-600">Select Course:</label>
                    <Dropdown options={courseDropdown}
                        optionLabel={"course_name"}
                        optionValue={"_id"}
                        onChange={courseChangeHandler}
                        value={selectedCourse}
                        placeholder="Select an option" />
                </div>}
                {FormField({ register: register, errors: errors, label: "Module Name:", type: "text", registerKey: "module_name" })}
                {FormField({ register: register, errors: errors, label: "Module Code:", type: "text", registerKey: "module_code" })}
                <div className="flex flex-col mt-4">
                    <label className="text-sm text-gray-600">Module Type:</label>
                    <Dropdown options={["THEORY", "ASSESSMENT"]}
                        onChange={moduleTypeChangeHandler}
                        disabled={isLoading}
                        placeholder="Select Module Type"
                    />
                    {errors.course_status && <span className="text-sm text-red-400">This field is required</span>}
                </div>
                <div className="flex flex-col  mt-4">
                    <label className="text-sm text-gray-600">Module Description:</label>
                    <Textarea
                        disabled={isLoading}
                        placeholder="Type your message here." {...register("module_desc", { required: true })} />
                    {errors?.course_desc && <span className="text-sm text-red-400">{errors?.course_desc?.message || "This field is required"}</span>}
                </div>
                {/* <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} /> */}
                <div className="mt-4">
                    <Button className={"hover:text-cyan-400"} disabled={isLoading} type="submit">
                        {isLoading ? <>
                            <Loader />
                            <span className="ml-2">
                                Creating Module
                            </span>
                        </>
                            : "Create Module"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateModule;
