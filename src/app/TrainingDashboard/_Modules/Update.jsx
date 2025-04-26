import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import style from "../Common/form.module.scss";
import { getAdmin_details_of_module } from "@/api/Super_Admin/qlite/getApis";
import AdminBackButton from "@/components/AdminBackButton";
import { InputTextarea } from "primereact/inputtextarea";
import { updateAdminModule } from "@/api/Super_Admin/qlite/updateApi";

const UpdateModule = () => {
    const { module_id } = useParams();
    const navigate = useNavigate();
    const [isEditedValues, setIsEditedValues] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const response = await getAdmin_details_of_module(module_id);
                if (response && !response.error) {
                    setIsEditedValues(response.data);
                    reset(response.data);
                } else {
                    toast.error(response?.data || "Failed to fetch Module data");
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchModule();
    }, [module_id, reset]);

    async function onSubmit(data) {
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdminModule(data);
            if (!resp.error) {
                toast.success(`Module updated successfully!!!`);
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/modules");
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

    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <AdminBackButton hardURL="/super-admin/dashboard/training-dashboard/modules" />
            </div>
            <h3>Updating Module</h3>
            <div style={{ color: "#dadada", fontSize: "12px", textAlign: "center" }}>
                <p>Course: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.module_id?.course_id?.course_name || "Course Name Not Found"}</span> </p>
            </div>
            <FormField register={register} errors={errors} label={"Module Code:"} type="text" registerKey={"module_code"} />
            <FormField register={register} errors={errors} label={"Module Name:"} type="text" registerKey={"module_name"} />
            <div className={style.flexColumn}>
                <label>Select Type:</label>
                <select style={{ fontSize: "1rem" }}
                    {...register('module_type', { required: true })}
                >
                    {["THEORY", "ASSESSMENT"].map((data, ind) => <option key={ind} value={data}>{data}</option>)}
                </select>
                {errors.module_type && <span>This field is required</span>}
            </div>
            <div className={style.flexColumn}>
                <label>Module Description:</label>
                <InputTextarea rows={5} className="pr"  {...register("module_desc", { required: true })} />
                {errors["module_desc"] && <span>{errors?.module_desc || "This field is required"}</span>}
            </div>
            <div className={style.flexRow}>
                <Button loading={isLoading} disabled={isLoading} className={style.submit} type="submit">Update Module</Button>
            </div>
        </form>
    );
};

export default UpdateModule;
