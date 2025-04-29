"use client";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminBackButton from "@/components/AdminBackButton";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Loader, Plus, Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Prime/Dropdown";
import { createAdmin_Assessment } from "@/api/_admin/createApi";
import { getCourses_and_Modules_list } from "@/api/_admin/getApis";

const CreateAssessment = () => {
    const ModuleType = "ASSESSMENT"
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseDropdown, setCourseDropdown] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm();

    const optCompProps = {
        initOptions: {}, setValue,
        control, register, errors
    }

    const getCoursesList = async () => {
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

    useEffect(() => {
        getCoursesList()
    }, [])


    async function onSubmit(data) {
        let { primary_text, correct_option, options, module_id } = data
        if (!module_id) return toast.error("Please Select Module or Create a Assessment Module");
        if (options.length == 0) return toast.error("Add Options");
        if (!correct_option) return toast.error("Choose a correct option");
        try {
            if (isLoading) return
            setIsLoading(true)
            correct_option = options[correct_option - 1]
            const resp = await createAdmin_Assessment({ module_id, primary_text, correct_option, options });
            if (!resp.error) {
                toast.success(`Assessment created successfully!!!`);
                setTimeout(() => {
                    const { course_id, module_id } = resp.data
                    redirect(`/admin/assessments?course_id=${course_id}&module_id=${module_id}`)
                }, 1200);
            } else {
                toast.error(resp?.data || "Unknown Error");
                setTimeout(() => {
                    throw new Error(resp?.data || "Unknown Error")
                }, 1200);
            }
        } catch (error) {
            toast.error(error.message);
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
                <AdminBackButton addOnPath="/assessments" />
                <h1 className="text-2xl">Create <span className="text-cyan-500">Assessment</span> </h1>
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
                {FormField({ register, errors, label: "Question:", fieldType: "text", registerKey: "primary_text" })}
                <OptionsField  {...optCompProps} />
                <div className="mt-4">
                    <Button className={"hover:text-cyan-400"} disabled={isLoading} type="submit">
                        {isLoading ? <>
                            <Loader />
                            <span className="ml-2">
                                Creating Assessment
                            </span>
                        </>
                            : "Create Assessment"}
                    </Button>
                </div>
            </form>
        </div>
    );
};


const OptionsField = ({ control, errors, setValue }) => {
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
            <Button
                type="button"
                style={{ padding: "6px 12px", marginTop: "2rem" }}
                onClick={addOption}  >
                <Plus /> Add Option
            </Button>
            {errors.options && <span>This field is required</span>}
        </div>
    );
};



export default CreateAssessment;
