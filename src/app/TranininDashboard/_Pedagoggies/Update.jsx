import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import { updateAdmin_Pedagogy } from "@/api/Super_Admin/qlite/updateApi";
import style from "../Common/form.module.scss";
import { getAdmin_details_of_pedagogy } from "@/api/Super_Admin/qlite/getApis";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { Editor } from "primereact/editor";
import "./EditorStyle.scss"

const UpdatePedagogy = () => {
    const { pedagogy_id } = useParams();
    const navigate = useNavigate();
    const [isEditedValues, setIsEditedValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        setValue,
        getValues,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();

    useEffect(() => {
        const fetchPedagogy = async () => {
            try {
                const response = await getAdmin_details_of_pedagogy(pedagogy_id);
                if (response && !response.error) {
                    setIsEditedValues(response.data);
                    reset(response.data);
                } else {
                    toast.error(response?.data || "Failed to fetch pedagogy data");
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchPedagogy();
    }, [pedagogy_id, reset]);

    async function onSubmit(data) {
        const text = data.text
        if (!text) return toast.info("Text field can't be empty.");
        if (isLoading) return
        setIsLoading(true)
        try {
            data._id = isEditedValues._id;
            data.module_id = isEditedValues.module_id;
            const resp = await updateAdmin_Pedagogy(data);
            if (!resp.error) {
                toast.success(`Pedagogy updated successfully!!!`);
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/pedagogies");
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

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage = "" }) => {
        return (
            <div className={style.flexColumn}>
                <label>{label}</label>
                <input
                    type={type}
                    {...register(registerKey, options)}
                />
                {errors[registerKey] && <span>{errorMessage || "This field is required"}</span>}
            </div>
        );
    };

    const textValue = isEditedValues?.text
    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <SuperAdminBackButton hardURL="/super-admin/dashboard/training-dashboard/pedagogies" />
            </div>
            <h3>Updating Pedagogy</h3>
            <div style={{ color: "#dadada", fontSize: "12px", textAlign: "center" }}>
                <p>Course: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.module_id?.course_id?.course_name || "Course Name Not Found"}</span> </p>
                <p>Module: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.module_id?.module_name || "Module Name Not Found"} </span> </p>
            </div>
            {FormField({ label: "Title:", type: "text", registerKey: "title" })}
            <div className={style.flexColumn}>
                <label>Text:</label>
                <TextQuillField control={control} value={textValue} register={register} setValue={setValue} />
                {errors?.text && <span style={{ fontSize: "12px", color: "red" }}>This field is required</span>}
            </div>
            {FormField({ label: "Url:", type: "text", registerKey: "url" })}
            <div className={style.flexColumn}>
                <label>Select Status:</label>
                <select
                    defaultValue={isEditedValues?.pedagogy_status || ""}
                    {...register('pedagogy_status', { required: true })}>
                    <option disabled value="">Select Status...</option>
                    {["PUBLISHED", "DRAFT", "ARCHIVED"].map((val, ind) => (
                        <option key={ind} value={val}>{val}</option>
                    ))}
                </select>
                {errors.pedagogy_status && <span>This field is required</span>}
            </div>
            <div className={style.flexRow}>
                <Button loading={isLoading} disabled={isLoading} className={style.submit} type="submit">Update Pedagogy</Button>
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
                onTextChange={(e) => {
                    setValue("text", e.htmlValue)
                }}
                pt={{ content: { style: { maxHeight: "500px", overflowY: "auto" } } }}
            />
        </div>
    );
};



export default UpdatePedagogy;
