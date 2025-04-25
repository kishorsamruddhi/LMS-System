import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import style from "../Common/form.module.scss";
import { getAdmin_details_of_course, getAdminSubscriptionPlans } from "@/api/Super_Admin/qlite/getApis";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { updateAdminCourse } from "@/api/Super_Admin/qlite/updateApi";

const UpdateCourse = () => {
    const { course_id } = useParams();
    const navigate = useNavigate();
    const [isEditedValues, setIsEditedValues] = useState(null);
    const [subpacks, setPacks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await getAdmin_details_of_course(course_id);
                if (response && !response.error) {
                    setIsEditedValues(response.data);
                    reset(response.data);
                } else {
                    toast.error(response?.data || "Failed to fetch Course data");
                }
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchCourse();
        getPacks()
    }, [course_id]);

    async function getPacks() {
        try {
            const resp = await getAdminSubscriptionPlans();
            if (!resp.error) {
                return setPacks(resp.data)
            }
            return
        } catch (error) {
            toast.error(error.message, { position: "top-left" });
        }
    }

    async function onSubmit(data) {
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdminCourse(data);
            if (!resp.error) {
                toast.success(`Course updated successfully!!!`);
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/courses");
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
                <SuperAdminBackButton hardURL="/super-admin/dashboard/training-dashboard/courses" />
            </div>
            <h3>Updating Course</h3>
            <div style={{ color: "#dadada", fontSize: "12px", textAlign: "center" }}>
                <p>Business: <span style={{ color: "var(--star-color)" }}>{isEditedValues?.business_id?.business_name || "Business Name Not Found"}</span> </p>
            </div>
            <FormField register={register} errors={errors} label={"Course Code:"} type="text" registerKey={"course_code"} />
            <FormField register={register} errors={errors} label={"Course Name:"} type="text" registerKey={"course_name"} />
            <FormField register={register} errors={errors} label={"Course Sequence:"} type="number" registerKey={"course_seq_no"} />
            <div className={style.flexColumn}>
                <label>Choose Subscription Pack:</label>
                <select
                    {...register('course_pack_id', { required: true })}>
                    {subpacks?.map((pack, index) => <option key={index} value={pack._id}>{pack.name}</option>)}
                </select>
                {errors.course_status && <span>This field is required</span>}
            </div>
            <div className={style.flex}>
                <FormField register={register} errors={errors} label={"Color:"} type="color" registerKey={"color"} />
                <div className={style.flexColumn}>
                    <label>Course Status:</label>
                    <select
                        {...register('course_status', { required: true })}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">In-Active</option>
                    </select>
                    {errors.course_status && <span>This field is required</span>}
                </div>
            </div>
            <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} />

            <div className={style.flexRow}>
                <Button loading={isLoading} disabled={isLoading} className={style.submit} type="submit">Update Course</Button>
            </div>
        </form>
    );
};

export default UpdateCourse;
