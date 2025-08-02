"use client";
import { Fragment, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Plus, Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { updateAdmin_Assessment } from "@/api/_admin/updateApi";
import EditViewPageHeader from "@/components/admin/EditViewPageHeader";
import { BtnWithLoading } from "@/components/TailwindBtn";

const Actions = ({ formValues = {} }) => {
    const { module_id, course_id, primary_text, correct_option, options, updatedAt } = formValues

    const modId = module_id?._id
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: { primary_text, correct_option, options }
    });

    const optCompProps = {
        initOptions: {}, setValue,
        editMode,
        control, register, errors
    }

    async function onSubmit(data) {
        if (!editMode) return
        const { primary_text, correct_option, options } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdmin_Assessment({ primary_text, correct_option, options, _id: formValues._id });
            if (!resp.error) {
                toast.success(`Assessment updated successfully!!!`);
                setTimeout(() => {
                    redirect(`/admin/assessments?course_id=${course_id}&module_id=${modId}`)
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

    function toggleMode() {
        setEditMode(prev => !prev)
    }

    return (<div style={{ padding: "2rem" }}>
        <EditViewPageHeader
            backBtnPath={`/assessments?course_id=${course_id}&module_id=${modId}`}
            headText={editMode ? "Updating" : "Viewing"}
            title={"Assessment"}
            toggler={toggleMode}
            time={updatedAt}
            editMode={editMode}
        />
        <div className="flex gap-4">
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">Course Name:</label>
                <Input
                    className={"font-light"}
                    readOnly
                    disabled={true}
                    value={module_id?.course_id?.course_name} />
            </div>
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">Module Name:</label>
                <Input
                    className={"font-light"}
                    readOnly
                    disabled={true}
                    value={module_id?.module_name} />
            </div>
        </div>
        <form style={{ minWidth: "unset", maxWidth: "unset", }} onSubmit={handleSubmit(onSubmit)}>
            {FormField({ register, errors, label: "Question:", fieldType: "text", registerKey: "primary_text" })}

            <OptionsField  {...optCompProps} />
            {editMode && <Fragment>
                <div className="mt-4">
                    <BtnWithLoading isLoading={isLoading} label={"Update Assessment"} disabled={isLoading || !editMode}
                        type="submit" loadingLable={"Updating Assessment"} />
                </div>
            </Fragment>
            }
        </form>
    </div>
    );
};


const OptionsField = ({ control, errors, setValue, editMode }) => {
    const [correctOption, setCorrectOption] = useState(null)
    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    function addOption() {
        append("")
    }

    useEffect(() => {
        if (correctOption !== null) {
            setValue("correct_option", correctOption)
        }
    }, [correctOption])


    return (
        <div className="flex flex-col mt-4">
            <label className="text-sm font-bold top-2 relative text-gray-600">Options:</label>
            {fields.map((item, index) => {
                return (
                    <div key={item.id} className={"flex gap-2 mt-4"}>
                        <Controller
                            name={`options[${index}]`}
                            control={control}
                            defaultValue={item?.value || ""}
                            render={({ field }) => {
                                return (
                                    <Input
                                        {...field}
                                        disabled={!editMode}
                                        type="text"
                                        className={correctOption === index + 1 ? "border border-green-400" : ""}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                )
                            }}
                        />
                        {correctOption === index + 1 ? <Button className={"text-green-400 border border-green-400 shadow-green-400"} type="button" >
                            <CircleCheckBig />
                        </Button> :
                            <Button className={"text-gray-400 shadow-gray-400 border-2"} type="button" onClick={() => setCorrectOption(index + 1)}>
                                <CircleCheckBig />
                            </Button>
                        }
                        <Button className={"text-red-400 shadow-red-400"} type="button" onClick={() => remove(index)}>
                            <Trash />
                        </Button>
                    </div>
                )
            })}
            {editMode && <Button
                type="button"
                disabled={!editMode}
                style={{ padding: "6px 12px", marginTop: "2rem" }}
                onClick={addOption}  >
                <Plus /> Add Option
            </Button>}
            {errors.options && <span>This field is required</span>}
        </div>
    );
};




export default Actions;
