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
import { formatDate } from "@/utils/timeFormatter";
import { Textarea } from "@/components/ui/textarea"
import { updateAdminModule } from "@/api/_admin/updateApi";

const Actions = ({ formValues = {} }) => {
    const { module_name, module_code, module_desc, module_type, course_id, updatedAt, module_seq_no } = formValues

    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: { module_name, module_code, module_desc, module_type, }
    });


    async function onSubmit(data) {
        if (!editMode) return
        const { module_name, module_code, module_desc } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdminModule({ module_name, module_code, module_desc, module_id: formValues._id });
            if (!resp.error) {
                toast.success(`Module updated successfully!!!`);
                setTimeout(() => {
                    redirect("/TrainingDashboard/modules");
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

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage = "", inputStyle = {} }) => {
        return (
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">{label}</label>
                <Input
                    className={"font-light"}
                    disabled={!editMode}
                    type={type}
                    style={inputStyle}
                    {...register(registerKey, options)}
                />
                {errors[registerKey] && <span className="text-sm text-red-400">{errors[registerKey]?.message || "This field is required"}</span>}
            </div>
        );
    };

    function toggleMode(val) {
        setEditMode(prev => !prev)
    }

    return (<div style={{ padding: "2rem" }}>
        <div style={{ width: "100%", }}>
            <AdminBackButton addOnPath="/modules" />
        </div>
        <div className="my-4 flex justify-between items-center">
            <h1 className="text-2xl">{editMode ? "Updating" : "Viewing"} <span className="text-cyan-500">Module</span> </h1>
            <Button type="button" onClick={toggleMode}>{editMode ? "Switch To View Mode" : "Switch To Edit Mode"}</Button>
            <Button>Last update on<span className="text-cyan-400">{formatDate(updatedAt)} </span>
            </Button>
        </div>
        <div className="flex flex-col mt-4">
            <label className="text-sm text-gray-600">Course Name:</label>
            <Input
                className={"font-light"}
                readOnly
                disabled={true}
                value={course_id.course_name} />
        </div>
        <form style={{ minWidth: "unset", maxWidth: "unset", }} onSubmit={handleSubmit(onSubmit)}>
            {FormField({ register: register, errors: errors, label: "Module Name:", type: "text", registerKey: "module_name" })}
            {FormField({ register: register, errors: errors, label: "Module Code:", type: "text", registerKey: "module_code" })}
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">Module Type:</label>
                <Dropdown options={["THEORY", "ASSESSMENT"]}
                    disabled={true}
                    value={module_type}
                    className="font-light"
                    placeholder="Select Module Type"
                />
                {errors.course_status && <span className="text-sm text-red-400">This field is required</span>}
            </div>
            <div className="flex flex-col  mt-4">
                <label className="text-sm text-gray-600">Module Description:</label>
                <Textarea
                    disabled={isLoading}
                    className="font-light"
                    placeholder="Type your message here." {...register("module_desc", { required: true })} />
                {errors?.course_desc && <span className="text-sm text-red-400">{errors?.course_desc?.message || "This field is required"}</span>}
            </div>
            {/* <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} /> */}
            <div className="mt-4">
                <Button className={"hover:text-cyan-400"} disabled={isLoading || !editMode} type="submit">
                    {isLoading ? <>
                        <Loader />
                        <span className="ml-2">
                            Updating Module
                        </span>
                    </>
                        : "Update Module"}
                </Button>
            </div>
        </form>
    </div>
    );
};

export default Actions;
