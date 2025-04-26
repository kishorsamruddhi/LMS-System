import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { createAdmin_Pedagogy } from "@/api/Super_Admin/qlite/createApi";
import { getCourses_and_Modules_list } from "@/api/Super_Admin/qlite/getApis";
import style from "../Common/form.module.scss";
import AdminBackButton from "@/components/AdminBackButton";
import { Dropdown } from "primereact/dropdown";
import { Editor } from "primereact/editor";
import "./EditorStyle.scss"

const CreatePedagogy = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [businessList, setBusinessList] = useState([]);
    const [selectedFields, setSelectedFields] = useState({ business: null, course: null, module: null });
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        business_id: "",
        course_id: "",
        module_id: "",
        text: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const resp = await getCourses_and_Modules_list("THEORY");
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
            const text = data.text
            if (!text) return toast.info("Text field can't be empty.");
            if (formLoading) return
            setFormLoading(true);
            if (!data?.course_id || !data?.business_id || !data?.module_id) {
                throw new Error("business_id, course_id, module_id are required")
            }
            const resp = await createAdmin_Pedagogy(data);
            if (!resp.error) {
                toast.success("Pedagogy created successfully!");
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/pedagogies");
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

    const FormField = ({ label, fieldType, registerKey, options = { required: true }, errorMessage = "" }) => {
        return <div className={style.flexColumn}>
            <label>{label}</label>
            <input
                type={fieldType}
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
            <h3>Create Pedagogy</h3>
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
            {FormField({ register, errors, label: "Title:", fieldType: "text", registerKey: "title" })}
            <div className={style.flexColumn}>
                <label>Text:</label>
                <TextQuillField control={control} register={register} setValue={setValue} />
                {errors?.text && <span style={{ fontSize: "12px", color: "red" }}>This field is required</span>}
            </div>
            {FormField({ register, errors, label: "Url:", fieldType: "text", registerKey: "url" })}
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
                {!isLoading && <Button loading={formLoading} disabled={formLoading} className={style.submit} type="submit">Create Pedagogy</Button>}
            </div>
        </form>
    );
};


const TextQuillField = ({ value = "", setValue }) => {
    const editorRef = useRef(null);
    return (
        <div className="Editor">
            <Editor
                ref={editorRef}
                value={value}
                defaultValue={value}
                onTextChange={(e) => {
                    setValue("text", e.htmlValue)
                }}
                pt={{ content: { style: { maxHeight: "500px", overflowY: "auto" } } }}
            />
        </div>
    );
};



export default CreatePedagogy;
