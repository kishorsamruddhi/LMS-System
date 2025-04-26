import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { getCourses_and_Modules_list } from "@/api/Super_Admin/qlite/getApis";
import style from "../Common/form.module.scss";
import AdminBackButton from "@/components/AdminBackButton";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { createAdmin_Assessment } from "@/api/Super_Admin/qlite/createApi";
import { Dropdown } from "primereact/dropdown";


const CreateAssessment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [businessList, setBusinessList] = useState([]);
    const [selectedFields, setSelectedFields] = useState({ business: null, course: null, module: null });
    const navigate = useNavigate();

    const {
        register,
        handleSubmit, control,
        setValue,
        formState: { errors },
    } = useForm({
        business_id: "",
        course_id: "", module_id: ""
    });


    const optCompProps = {
        initOptions: {},
        control, register, errors
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const resp = await getCourses_and_Modules_list("ASSESSMENT");
                if (!resp.error && resp?.data?.length > 0) {
                    setBusinessList(resp.data);
                    setSelectedFields({
                        business: resp.data[0],
                        course: resp.data[0]?.courses[0] || null,
                        module: resp.data[0]?.courses[0]?.modules[0] || null,
                    });
                    setValue("business_id", resp.data[0]?._id || null)
                    setValue("course_id", resp.data[0]?.courses[0]._id || null)
                    setValue("module_id", resp.data[0]?.courses[0]?.modules[0]?._id || null)

                } else {
                    setIsError(true);
                }
            } catch (error) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        try {
            if (!data?.course_id || !data?.business_id || !data?.module_id) {
                throw new Error("business_id, course_id, module_id are required")
            }
            data.module_id = selectedFields.module._id
            const opts = data?.options?.length
            if (opts < 2) {
                return toast.error("Minimum 2 Options are required");
            }
            if (formLoading) return
            setFormLoading(true);
            const resp = await createAdmin_Assessment(data);
            if (!resp.error) {
                toast.success("Assessment created successfully!");
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/assessments");
                }, 1200);
            } else {
                toast.error(resp?.data || "Unknown error");
            }
        } catch (error) {
            toast.error(error.message);
        }
        finally {
            setFormLoading(false);
        }
    };

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage = "" }) => {
        return <div className={style.flexColumn}>
            <label>{label}</label>
            <input
                type={type}
                {...register(registerKey, options)}
            />
            {errors[registerKey] && <span>{errorMessage || "This field is required"}</span>}
        </div>
    }

    const courseList = selectedFields?.business?.courses || []
    const moduleList = selectedFields?.course?.modules || []

    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <AdminBackButton />
            </div>
            <h3>Create Assessment</h3>
            <div className={style.flexColumn}>
                <label>Select Business:</label>
                <Controller
                    name="business_id"
                    control={control}
                    defaultValue={selectedFields?.business || null}
                    rules={{ required: 'Business selection is required' }}
                    render={({ field }) => (
                        <Dropdown
                            style={{ minWidth: "400px", width: "100%" }}
                            options={businessList || []}
                            onChange={(e) => {
                                const val = e.target.value
                                field.onChange(val?._id);
                                setSelectedFields({ business: val, course: null, module: null })
                            }}
                            value={selectedFields.business}
                            optionLabel="business_name"
                            placeholder="Select Business"
                            className="pr"
                        />
                    )}
                />
                {errors.business_id && <span style={{ fontSize: "12px", color: 'red' }}>This field is required.</span>}
            </div>
            <div className={style.flexColumn}>
                <label>Select Course:</label>
                {courseList.length == 0 ? <p>Business has 0 Courses</p> :
                    <Controller
                        name="course_id"
                        control={control}
                        defaultValue={selectedFields?.course || null}
                        rules={{ required: 'Course selection is required' }}
                        render={({ field }) => (
                            <Dropdown style={{ minWidth: "400px", width: "100%" }} options={courseList || []}
                                onChange={(e) => {
                                    const val = e.target.value
                                    field.onChange(val?._id);
                                    setSelectedFields(pre => ({ ...pre, course: val, module: null }))
                                }} value={selectedFields.course}
                                optionLabel="course_name"
                                placeholder="Select Course" className="pr" />
                        )} />}
                {errors.course_id && <span style={{ fontSize: "12px", color: 'red' }}>This field is required.</span>}
            </div>
            <div className={style.flexColumn}>
                <label>Select Module:</label>
                {moduleList.length == 0 ? <p>Course has 0 Modules</p> :
                    <Controller
                        name="module_id"
                        control={control}
                        defaultValue={selectedFields?.module || null}
                        rules={{ required: 'Module selection is required' }}
                        render={({ field }) => (
                            <Dropdown style={{ minWidth: "400px", width: "100%" }} options={moduleList || []}
                                onChange={(e) => {
                                    const val = e.target.value
                                    field.onChange(val?._id);
                                    setSelectedFields(pre => ({ ...pre, module: val }))
                                }}
                                value={selectedFields.module}
                                optionLabel="module_name"
                                placeholder="Select Module" className="pr" />
                        )} />}
                {errors.module_id && <span style={{ fontSize: "12px", color: 'red' }}>This field is required.</span>}
            </div>
            <FormField register={register} errors={errors} label={"Primary Text:"} type="text" registerKey={"primary_text"} />
            <OptionsField  {...optCompProps} />
            <FormField register={register} errors={errors} label={"Correct Option:"} type="text" registerKey={"correct_option"} />
            <div className={style.flexColumn}>
                <label>Select Status:</label>
                <select {...register("pedagogy_status", { required: true })}>
                    <option disabled value="">Select Status...</option>
                    {["PUBLISHED", "DRAFT"].map((val) => (
                        <option key={val} value={val}>{val}</option>
                    ))}
                </select>
                {errors.pedagogy_status && <span>This field is required</span>}
            </div>
            <div className={style.flexRow}>
                {!isLoading && <Button loading={formLoading} disabled={formLoading} className={style.submit} type="submit">Create Assessment</Button>}
            </div>
        </form>
    );
};

const OptionsField = ({ control, errors }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    return (
        <div className={style.flexColumn}>
            <label>Options:</label>
            {fields.map((item, index) => {
                return (
                    <div key={item.id} className={style.fieldWithIcon}>
                        <Controller
                            name={`options[${index}]`}
                            control={control}
                            defaultValue={item?.value || ""}
                            render={({ field }) => {
                                return (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                )
                            }}
                        />
                        <Button
                            type="button" text
                            onClick={() => remove(index)}
                            icon="pi pi-trash" />
                    </div>
                )
            })}
            <Button
                style={{ padding: "6px 12px" }}
                className={style.addOption} text type="button" onClick={() => append("")} icon="pi pi-plus" />
            {errors.options && <span>This field is required</span>}
        </div>
    );
};


export default CreateAssessment;
