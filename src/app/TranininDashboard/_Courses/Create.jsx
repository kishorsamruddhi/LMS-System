import style from "../Common/form.module.scss";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { getAdminSubscriptionPlans, getBusinesses_and_Courses_list } from "@/api/Super_Admin/qlite/getApis";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { Dropdown } from "primereact/dropdown";
import { createAdminCourse } from "@/api/Super_Admin/qlite/createApi";

const CreateCourse = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [businessList, setBusinessList] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [subpacks, setPacks] = useState([]);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await getBusinesses_and_Courses_list();
                if (!resp.error && resp?.data?.length > 0) {
                    setBusinessList(resp.data);
                    setSelectedBusiness(resp.data[0]);
                    setValue("business_id", resp.data[0]?._id)
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
        getPacks()
    }, []);

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

    const onSubmit = async (data) => {
        try {
            if (formLoading || isLoading) return
            setFormLoading(true);
            data.business_id = selectedBusiness?._id
            if (!data?.business_id) {
                throw new Error("business_id are required")
            }
            const resp = await createAdminCourse(data);
            if (!resp.error) {
                toast.success("Course created successfully!");
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/courses");
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


    const handleBusinessChange = (e) => {
        setValue("business_id", e.value?._id)
        setSelectedBusiness(e.value)
    }

    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <SuperAdminBackButton />
            </div>
            <h2 style={{ borderBottom: "2px solid var(--star-color)" }}>Create Course</h2>
            <div className={style.selectGrid}>

                <div className={style.flexColumn}>
                    <label>Select Business:</label>
                    <Dropdown style={{ minWidth: "400px", width: "fit-content" }} options={businessList || []}
                        onChange={handleBusinessChange}
                        value={selectedBusiness}
                        optionLabel="business_name"
                        placeholder="Select Business" className="pr" />
                    {errors.business_id && <span>This field is required</span>}
                </div>
                <div className={style.flexColumn}>
                    <label>Choose Subscription Pack:</label>
                    {/* <select
                    {...register('course_pack_id', { required: true })}>
                    {subpacks?.map((pack, index) => <option key={index} value={pack._id}>{pack.name}</option>)}
                </select> */}
                    <Controller
                        name="course_pack_id"
                        control={control}
                        defaultValue={null}
                        rules={{ required: 'Course Subscription lvl is required' }}
                        render={({ field }) => (
                            <Dropdown
                                style={{ minWidth: "400px", width: "fit-content" }}
                                options={subpacks || []}
                                onChange={(e) => {
                                    const val = e.value ? e.value : null;
                                    // setSelectedPack(val)
                                    field.onChange(val);
                                }}
                                value={field.value}
                                optionLabel="name"
                                optionValue="_id" // Uncommented to specify the value property
                                placeholder="Select Subscription lvl"
                                className="pr"
                            />
                        )}
                    />
                    {errors.course_status && <span>This field is required</span>}
                </div>
            </div>
            <FormField register={register} label={"Course Code:"} type="text" registerKey={"course_code"} />
            <FormField register={register} label={"Course Name:"} type="text" registerKey={"course_name"} />
            <FormField register={register} label={"Course Sequence:"} type="number" registerKey={"course_seq_no"} />

            <div className={style.flex}>
                <FormField register={register} label={"Color:"} type="color" registerKey={"color"} />
                <div className={style.flexColumn}>
                    <label>Course Status:</label>
                    {/* <select
                        {...register('course_status', { required: true })}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">In-Active</option>
                    </select> */}
                    <Controller
                        name="course_status"
                        control={control}
                        defaultValue={null}
                        rules={{ required: 'Course Status is required' }}
                        render={({ field }) => (
                            <Dropdown
                                style={{ minWidth: "400px", width: "fit-content" }}
                                onChange={field.onChange}
                                value={field.value}
                                options={["Active", "INACTIVE"]}
                                placeholder="Select Course Status"
                                className="pr"
                            />
                        )}
                    />

                    {errors.course_status && <span>This field is required</span>}
                </div>
            </div>
            <FormField register={register} errors={errors} label={"Course Description:"} type="text" registerKey={"course_desc"} />
            <div className={style.flexRow}>
                {!isLoading && <Button loading={formLoading} disabled={formLoading} className={style.submit} type="submit">Create Course</Button>}
            </div>
        </form>
    );
};

export default CreateCourse;
