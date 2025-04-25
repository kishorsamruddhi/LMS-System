import "../Common/styles.scss";
import style from "../Common/form.module.scss"
import _DataTable from "./DataTable";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { getAdmin_Businesses, get_List_of_Admins } from "@/api/Super_Admin/qlite/getApis";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/Loading";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";
import { createAdminBusiness } from "@/api/Super_Admin/qlite/createApi";
import { toast } from "react-toastify";
import { updateAdminBusiness } from "@/api/Super_Admin/qlite/updateApi";
import { Dropdown } from 'primereact/dropdown';

const _Businesses = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisibility, setDialogVisibility] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [data, setData] = useState([]);
    const [admins_List, setAdminsList] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });

    const getTableData = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const resp = await getAdmin_Businesses(pagination);
            if (!resp.error) {
                setData(resp.data);
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error("Error fetching courses data:", error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const dropDownData = async () => {
        try {
            const resp = await get_List_of_Admins();
            if (!resp.error) {
                setAdminsList(resp.data);
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
        }
    }

    useEffect(() => {
        dropDownData();
    }, []);

    useEffect(() => {
        getTableData();
    }, [pagination]);

    useEffect(() => {
        if (!dialogVisibility && isEdit) {
            setEdit(false)
        }
    }, [dialogVisibility]);

    const refreshTableData = async () => {
        return await getTableData()
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const tableProps = { data, pagination, setPagination, refreshTableData, setEdit, isEdit, setDialogVisibility }

    const dialogProps = {
        admins_List,
        setEdit, isEdit, getTableData, dialogVisibility, setDialogVisibility
    }

    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <SuperAdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Businesses Management</h1>
                <Button onClick={() => setDialogVisibility(true)} label="Create Business" className="start p-0 pr" />
            </div>
            <div className="data-table">
                <div className="table">
                    <_DataTable {...tableProps} />
                </div>
            </div>
            {dialogVisibility && <TestDialog {...dialogProps} />}
        </div>
    );
};

const TestDialog = ({ admins_List, setEdit, isEdit, getTableData, dialogVisibility, setDialogVisibility }) => {
    const isEditedValues = isEdit || {}
    const isCreatingNewCourse = isEdit ? false : true

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            admin_id: ""
        }
    });

    async function onSubmit(data) {
        try {
            let resp;
            if (!data.admin_id) throw new Error("Assign Admin is required!!")
            if (!isCreatingNewCourse) {
                data._id = isEdit._id
                data.course_seq_no = parseInt(data.course_seq_no)
                resp = await updateAdminBusiness(data)
            }
            else {
                resp = await createAdminBusiness(data)
            }
            if (!resp.error) {
                toast.success(`Course ${isCreatingNewCourse ? "created" : "updated"} successfully!!!`)
                setTimeout(() => {
                    getTableData()
                    setDialogVisibility(false)
                    if (isEdit !== false) {
                        setEdit(false)
                    }
                }, 1200);
            }
            else {
                toast.error(resp?.data || "Unknown Error")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage }) => {
        return <div className={style.flexColumn}>
            <label>{label}</label>
            <input
                type={type}
                defaultValue={isEditedValues ? isEditedValues[registerKey] : ""}
                {...register(registerKey, options)}
            />
            {errors[registerKey] && <span>{errorMessage || "This field is required"}</span>}
        </div>
    }
    return (
        <Dialog
            draggable={false}
            header="Create Business"
            visible={dialogVisibility}
            className='pr'
            style={{ width: '50vw' }}
            onHide={() => {
                setDialogVisibility(false)
                setEdit(false)
            }}
        >
            <form className={style.form} onSubmit={handleSubmit(onSubmit)}>
                {isCreatingNewCourse &&<div className={style.flexColumn}>
                    <label style={{ marginBottom: "4px" }}>Assign Admin: </label>
                    <VirtualScrollDemo list_Data={admins_List} setValue={setValue} />
                </div>}
                <FormField label={"Business Name:"} type="text" registerKey={"business_name"} />
                <FormField label={"Email:"} type="text" registerKey={"email"} />
                <FormField label={"Mobile Number:"} type="number" registerKey={"phone"} />
                <FormField label={"Business Category:"} type="text" registerKey={"category"} />
                <FormField label={"Description:"} type="text" registerKey={"business_desc"} />
                <Button className={style.submit} type="submit">Submit</Button>
            </form>
        </Dialog>
    );
};


function VirtualScrollDemo({ list_Data, setValue }) {
    const [selectedItem, setSelectedItem] = useState(null);

    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <span className={style.dropDown}>{option.email}</span>
            );
        }

        return <span className={style.dropDown}>{props.placeholder}</span>;
    };

    const optionValueTemplate = (option) => {
        return (
            <div>
                <span>{option.email}</span>
                <span style={{ fontSize: "12px", color: "#767676", marginLeft: "6px" }}>{option.phoneNumber}</span>
            </div>
        );
    };


    return (
        <Dropdown className="prime-dropDown" style={{ width: "100%" }}
            value={selectedItem}
            valueTemplate={selectedValueTemplate}
            itemTemplate={optionValueTemplate}
            onChange={(e) => {
                setValue("admin_id", e.value)
                setSelectedItem(e.value)
            }}
            options={list_Data}
            optionValue="_id"
            virtualScrollerOptions={{ itemSize: 30 }}
            placeholder="Assign Admin" />
    )
}

export default _Businesses;
