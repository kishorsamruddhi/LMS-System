import "../Common/styles.scss";
import _DataTable from "./DataTable";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { getAdmin_Courses } from "@/api/Super_Admin/qlite/getApis";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/Loading";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { getAdmin_Business_List_DropDown } from "@/api/Super_Admin/qlite/getApis";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";

const _Courses = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisibility, setDialogVisibility] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [data, setData] = useState([]);
    const [businessList, setBusinessList] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });

    const getCoursesData = async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            const resp = await getAdmin_Courses(selectedBusiness?._id, pagination);
            if (!resp.error) {
                setData(resp.data);
            } else {
                setIsError(true);
                throw new Error(resp.data || "Unknown Error");
            }
        } catch (error) {
            console.error("Error fetching courses data:", error.message);
            toast.error(error.message)
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getListData = async () => {
        try {
            const resp = await getAdmin_Business_List_DropDown();
            if (!resp.error) {
                setBusinessList(resp.data);
                if (resp.data[0]._id) {
                    setSelectedBusiness(resp.data[0])
                }
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
        }
    };

    useEffect(() => {
        getListData()
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            getCoursesData();
        }
    }, [pagination, selectedBusiness?._id]);

    useEffect(() => {
        if (!dialogVisibility && isEdit) {
            setEdit(false)
        }
    }, [dialogVisibility]);

    const refreshTableData = async () => {
        return await getCoursesData()
    }

    if (isLoading && data.length == 0 && !isError) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const tableProps = { isLoading, data, pagination, setPagination, refreshTableData }
    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <SuperAdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Courses Management</h1>
                <Link style={{ padding: "6px 1rem", textDecoration: "none" }} to={"create"} className="start p-0 pr" >Create Course</Link>
            </div>
            <div style={{ marginTop: "2rem" }}>
                <h4 style={{ marginBottom: ".625rem" }}>Select Business:</h4>
                <Dropdown style={{ minWidth: "400px" }} options={businessList || []} onChange={(e) => setSelectedBusiness(e.value)} value={selectedBusiness}
                    optionLabel="business_name"
                    placeholder="Select Business/Company" className="pr" />
            </div>
            <div className="data-table">
                <div className="table">
                    <_DataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};


export default _Courses;
