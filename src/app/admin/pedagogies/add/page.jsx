"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminBackButton from "@/components/AdminBackButton";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Prime/Dropdown";
import { createAdmin_Pedagogy } from "@/api/_admin/createApi";
import { getCourses_and_Modules_list } from "@/api/_admin/getApis";
import dynamic from 'next/dynamic'
import { BtnWithLoading } from "@/components/TailwindBtn";
const TextQuillField = dynamic(() => import("./Quill"), { ssr: false })

export default function Page() {
    const ModuleType = "THEORY"
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseDropdown, setCourseDropdown] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    useEffect(() => {
        getCoursesList()
    }, [])

    async function getCoursesList() {
        try {
            const course_resp = await getCourses_and_Modules_list(ModuleType);
            if (!course_resp?.error) {
                const arr = course_resp.data
                setCourseDropdown(arr);
                setSelectedCourse(arr[0]._id)
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(error.message);
        }
    };

    async function onSubmit(data) {                                             
        const { module_id, text, title, url } = data
        if (!module_id) return toast.error("Please Select Module or Create a Theory Module");
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await createAdmin_Pedagogy({ module_id, text, title, url });
            if (!resp.error) {
                toast.success(`Pedagogy created successfully!!!`);
                setTimeout(() => {
                    const { course_id, module_id } = resp.data
                    redirect(`/admin/pedagogies?course_id=${course_id}&module_id=${module_id}`)
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

    function courseChangeHandler(val) {
        setSelectedCourse(val)
    }

    function moduleChangeHandler(val) {
        setValue("module_id", val)
    }

    const modulesList = Array.isArray(courseDropdown) ? courseDropdown.find(val => val._id === selectedCourse)?.modules : []

    return (
        <div style={{ padding: "2rem" }}>
            <div className="my-4 flex gap-4 items-center">
                <AdminBackButton addOnPath="/pedagogies" />
                <h1 className="text-2xl">Create <span className="text-cyan-500">Pedagogy</span> </h1>
            </div>
            <form style={{ minWidth: "unset", maxWidth: "unset", }} onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-4 items-center">
                    {courseDropdown && courseDropdown.length > 0 ? <Dropdown options={courseDropdown}
                        optionLabel={"course_name"}
                        optionValue={"_id"}
                        onChange={courseChangeHandler}
                        value={selectedCourse}
                        placeholder="Select Course" /> : <Button
                            disabled={true}
                            className="text-red-400 text-sm">You don't have any courses</Button>}
                    {selectedCourse && modulesList.length > 0 ? <Dropdown options={modulesList}
                        optionLabel={"module_name"}
                        optionValue={"_id"}
                        onChange={moduleChangeHandler}
                        placeholder="Select Module" /> : <Button
                            disabled={true}
                            className="text-red-400 text-sm">Course has 0 module of {ModuleType}</Button>}
                </div>
                {FormField({ register, errors, label: "Title:", fieldType: "text", registerKey: "title" })}
                {FormField({ register, errors, label: "Video Url:", fieldType: "text", registerKey: "url" })}
                <div className="flex flex-col  mt-4">
                    <label className="text-sm text-gray-600">Text:</label>
                    <Suspense fallback={<p>Loading...</p>}>
                        <TextQuillField setValue={setValue} />
                    </Suspense>
                    {errors?.text && <span className="text-sm text-red-400">{errors?.text?.message || "This field is required"}</span>}
                </div>
                {/* <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} /> */}
                <div className="mt-4">
                    <BtnWithLoading
                        isLoading={isLoading}
                        label={"Create Pedagogy"}
                        loadingLable={"Creating Pedagogy"}
                        disabled={isLoading} type="submit" />
                </div>
            </form>
        </div>
    );
};

