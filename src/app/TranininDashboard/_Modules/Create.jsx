import style from "../Common/form.module.scss";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { createAdminModule } from "@/api/Super_Admin/qlite/createApi";
import { getBusinesses_and_Courses_list } from "@/api/Super_Admin/qlite/getApis";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import LoadingSpinner from "@/Loading";

const CreateModule = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [businessList, setBusinessList] = useState([]);
    const [selectedFields, setSelectedFields] = useState({ business: null, course: null });
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        course_id: "", business_id: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await getBusinesses_and_Courses_list();
                if (!resp.error && resp?.data?.length > 0) {
                    setBusinessList(resp.data);
                    setSelectedFields({
                        business: resp.data[0],
                        course: resp.data[0]?.courses[0] || null,
                    });
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
            if (formLoading) return
            setFormLoading(true);
            if (!data?.course_id || !data?.business_id) {
                throw new Error("business_id, course_id are required")
            }
            const resp = await createAdminModule(data);
            if (!resp.error) {
                toast.success("Module created successfully!");
                setTimeout(() => {
                    navigate("/super-admin/dashboard/training-dashboard/modules");
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

    if (isLoading) {
        return <LoadingSpinner height="60vh" />
    }

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const FormField = ({ label, fieldType, registerKey, options = { required: true }, }) => {
        return <div className={style.flexColumn}>
            <label>{label}</label>
            <input
                type={fieldType}
                {...register(registerKey, options)}
            />
            {errors[registerKey] && <span>This field is required</span>}
        </div>
    }

    const courseList = selectedFields?.business?.courses || []

    return (
        <form style={{ minWidth: "unset", maxWidth: "unset", padding: "2rem" }} className={style.form} onSubmit={handleSubmit(onSubmit)}>
            <div style={{ width: "100%", }}>
                <SuperAdminBackButton />
            </div>
            <h3>Create Module</h3>
            <div className={style.selectGrid}>
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
                                    setSelectedFields({ business: val, course: null })
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
                                        setSelectedFields(pre => ({ ...pre, course: val }))
                                    }} value={selectedFields.course}
                                    optionLabel="course_name"
                                    placeholder="Select Course" className="pr" />
                            )}
                        />
                    }
                    {errors.course_id && <span style={{ fontSize: "12px", color: 'red' }}>This field is required.</span>}
                </div>
            </div>
            <FormField register={register} label={"Module Code:"} fieldType="text" registerKey={"module_code"} />
            <FormField register={register} label={"Module Name:"} fieldType="text" registerKey={"module_name"} />
            <div className={style.flexColumn}>
                <label>Select Type:</label>
                <select style={{ fontSize: "1rem" }}
                    {...register('module_type', { required: true })}
                >
                    {["THEORY", "ASSESSMENT"].map((data, ind) => <option key={ind} value={data}>{data}</option>)}
                </select>
                {errors?.module_type && <span>This field is required</span>}
            </div>
            <div className={style.flexColumn}>
                <label>Module Description:</label>
                <InputTextarea rows={5} className="pr"  {...register("module_desc", { required: true })} />
                {errors?.module_desc && <span style={{ fontSize: "12px", color: "red" }}>This field is required</span>}
            </div>

            <div className={style.flexRow}>
                {!isLoading && <Button loading={formLoading} disabled={formLoading} className={style.submit} type="submit">Create Module</Button>}
            </div>
        </form>
    );
};

export default CreateModule;
