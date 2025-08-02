"use client";
import { useState, } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Prime/Dropdown";
import { Textarea } from "@/components/ui/textarea"
import { updateAdminCourse } from "@/api/_admin/updateApi";
import { BtnWithLoading } from "@/components/TailwindBtn";
import EditViewPageHeader from "@/components/admin/EditViewPageHeader";


const UpdateCourse = ({ formValues = {} }) => {
    const { course_code, course_name, course_desc, color, course_status, course_seq_no, updatedAt } = formValues
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        defaultValues: { course_code, course_name, course_desc, color, course_status }
    });


    async function onSubmit(data) {
        if (!editMode) return
        const { course_code, course_name, course_desc, color, course_status } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdminCourse({ course_code, course_name, course_desc, color, course_status, course_id: formValues._id });
            if (!resp.error) {
                toast.success(`Course updated successfully!!!`);
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

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage = "", inputStyle = {} }) => {
        return (
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">{label}</label>
                <Input
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

    function statusChange(val) {
        setValue("course_status", val)
    }
    return (<div style={{ padding: "2rem" }}>
        <EditViewPageHeader
            backBtnPath={"/courses"}
            headText={editMode ? "Updating" : "Viewing"}
            title={"Course"}
            toggler={toggleMode}
            time={updatedAt}
            editMode={editMode}
        />

        <form style={{ minWidth: "unset", maxWidth: "unset" }} onSubmit={handleSubmit(onSubmit)}>
            <FormField register={register} errors={errors} label={"Course Code:"} type="text" registerKey={"course_code"} />
            <FormField register={register} errors={errors} label={"Course Name:"} type="text" registerKey={"course_name"} />
            {/* <FormField register={register} errors={errors} label={"Course Sequence:"} type="number" registerKey={"course_seq_no"} /> */}
            <div className="flex gap-4">
                <FormField inputStyle={{ width: "100px" }} register={register} errors={errors} label={"Color:"} type="color" registerKey={"color"} />
                <div className="flex flex-col  mt-4">
                    <label className="text-sm text-gray-600">Course Status:</label>
                    <Dropdown options={["ACTIVE", "INACTIVE"]} value={course_status}
                        onChange={statusChange}
                        disabled={!editMode}
                        placeholder="Select Status"
                    />
                    {errors.course_status && <span className="text-sm text-red-400">This field is required</span>}
                </div>
            </div>
            <div className="flex flex-col  mt-4">
                <label className="text-sm text-gray-600">Course Description:</label>
                <Textarea disabled={!editMode} placeholder="Type your message here." {...register("course_desc", { required: true })} />
                {errors?.course_desc && <span className="text-sm text-red-400">{errors?.course_desc?.message || "This field is required"}</span>}
            </div>
            {/* <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} /> */}
            <div className="mt-4">
                <BtnWithLoading isLoading={isLoading} label={"Update Course"} disabled={isLoading || !editMode}
                    type="submit" loadingLable={"Updating Course"} />
            </div>
        </form>
    </div>
    );
};

export default UpdateCourse;
