import "../Common/styles.scss";
import _DataTable from "./DataTable";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { getAdmin_modules_by_courseId, getAdmin_Course_List_DropDown, getAdmin_Business_List_DropDown } from "@/api/Super_Admin/qlite/getApis";
import { useEffect, useState } from "react";

import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";

const _Modules = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [data, setData] = useState([]);
    const [selected_fields, setSelected_fields] = useState({ business: null, course: null })
    const [dropdown_list, set_Dropdown_list] = useState({ businesses: [], courses: [] })

    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });

    const getTableData = async () => {
        if (!selected_fields?.business?._id || !selected_fields?.course?._id) return
        setIsLoading(true);
        setIsError(false);
        try {
            const resp = await getAdmin_modules_by_courseId(selected_fields?.course?._id);
            if (!resp.error) {
                setData(resp.data.modules);
            } else {
                setIsError(true);
            }
        } catch (error) {
            console.error(error.message);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getBusinessList = async () => {
        try {
            const business_resp = await getAdmin_Business_List_DropDown();
            if (!business_resp.error) {
                set_Dropdown_list({ businesses: business_resp.data, courses: [] });
                setSelected_fields({ business: business_resp.data[0] || null, course: null });
                return business_resp.data[0];
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(error.message);
        }
    };

    const getCoursesList = async () => {
        try {
            const checkVaild = selected_fields?.business?._id
            if (!checkVaild) return
            const course_resp = await getAdmin_Course_List_DropDown(checkVaild);
            if (!course_resp.error) {
                set_Dropdown_list(pre => ({ ...pre, courses: course_resp.data }));
                setSelected_fields(pre => ({ ...pre, course: course_resp.data[0] || null }));
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(error.message);
        }
    };

    const getListData = async () => {
        try {
            setIsLoading(true);
            await getBusinessList();
        } catch (error) {
            setIsError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getListData()
    }, []);


    useEffect(() => {
        if (selected_fields?.business?._id)
            getCoursesList()
    }, [selected_fields?.business?._id]);

    useEffect(() => {
        setData([])
        if (selected_fields?.course?._id && selected_fields?.business?._id) {
            getTableData()
        }
    }, [selected_fields?.course?._id]);

    const refreshTableData = async () => {
        return await getTableData()
    }

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const tableProps = { refreshTableData, data, isLoading, pagination, setPagination }

    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <SuperAdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Modules Management</h1>
                <Link style={{ padding: "6px 1rem", textDecoration: "none" }} to={"create"} className="start p-0 pr" >Create Module</Link>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }} >
                <div>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Business:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={dropdown_list.businesses || []}
                        onChange={(e) => setSelected_fields(pre => ({ ...pre, business: e.value }))}
                        value={selected_fields.business}
                        optionLabel="business_name"
                        placeholder="Select Business" className="pr" />
                </div>
                <div>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Course:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={dropdown_list.courses || []}
                        onChange={(e) => setSelected_fields(pre => ({ ...pre, course: e.value }))}
                        value={selected_fields.course}
                        optionLabel="course_name"
                        placeholder="Select Course" className="pr" />
                </div>
            </div>
            <div className="data-table">
                <div className="table">
                    <_DataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};

export default _Modules;
