import { useState, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import { updateAdmin_Assessment } from "@/api/Super_Admin/qlite/updateApi";
import style from "../Common/form.module.scss";
import { getAdmin_details_of_asmt } from "@/api/Super_Admin/qlite/getApis";
import AdminBackButton from "@/components/AdminBackButton";

const UpdateAssessment = () => {
    const { assessment_id } = useParams();
    const navigate = useNavigate();
    const [isEditedValues, setIsEditedValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();


    const optCompProps = {
        initOptions: {},
        control, register, errors
    }


    useEffect(() => {
        const fetchPedagogy = async () => {
            try {
                const response = await getAdmin_details_of_asmt(assessment_id);
                if (response && !response.error) {
                    setIsEditedValues(response.data);
                    reset(response.data);
                } else {
                    toast.error(response?.data || "Failed to fetch assessment data");
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchPedagogy();
    }, [assessment_id, reset]);

    async function onSubmit(data) {

        try {
            const opts = data?.options?.length
            if (opts < 2) {
                return toast.error("Minimum 2 Options are required");
            }
            if (isLoading) return
            setIsLoading(true);
            const resp = await updateAdmin_Assessment(data);
            if (!resp.error) {
                toast.success(`Assessment updated successfully!!!`);
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/assessments");
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


    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <AdminBackButton hardURL="/super-admin/dashboard/training-dashboard/assessments" />
            </div>
            <h3>Updating Assessment</h3>
            <div style={{ color: "#dadada", fontSize: "12px", textAlign: "center" }}>
                <p>Course: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.module_id?.course_id?.course_name || "Course Name Not Found"}</span> </p>
                <p>Module: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.module_id?.module_name || "Module Name Not Found"} </span> </p>
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
                <Button loading={isLoading} disabled={isLoading} className={style.submit} type="submit">Update Pedagogy</Button>
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

export default UpdateAssessment;
