import "../Common/styles.scss";
import _DataTable from "./DataTable";
import SuperAdminBackButton from "@/components/ui/SuperAdminBackButton";
import { getAdmin_assessments_by_module_id, getCourses_and_Modules_list } from "@/api/Super_Admin/qlite/getApis";
import { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";


const _Assessments = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [business_List, setBusiness_List] = useState([])
    const [selected_Fields, setSelected_Fields] = useState({
        business: null,
        course: null, module: null
    });
    const [data, setData] = useState([]);

    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });

    const getTableData = async () => {

        if (!selected_Fields.module._id) return
        setIsLoading(true);
        setIsError(false);
        try {
            const resp = await getAdmin_assessments_by_module_id(selected_Fields?.module?._id);
            console.log(resp);

            if (!resp.error) {

                setData(resp.data.assessments
                );
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

    const getListData = async () => {
        try {
            const resp = await getCourses_and_Modules_list("ASSESSMENT");
            if (!resp.error) {
                if (resp?.data?.length > 0) {
                    setBusiness_List(resp?.data);
                    const getFirstBusiness = resp?.data[0]
                    const getFirstCourse = getFirstBusiness?.courses[0] || []
                    const getFirstModule = getFirstCourse?.modules[0] || []
                    setSelected_Fields({ business: getFirstBusiness, course: getFirstCourse, module: getFirstModule })
                }
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getListData()
    }, [])

    useEffect(() => {
        if (selected_Fields?.module?._id) {
            getTableData()
        }
    }, [selected_Fields?.module?._id])


    const refreshTableData = async () => {
        return await getTableData()
    }


    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const tableProps = { refreshTableData, data: selected_Fields?.module ? data : [], isLoading, pagination, setPagination }


    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <SuperAdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Assessments Management</h1>
                <Link style={{ padding: "6px 1rem", textDecoration: "none" }} to={"create"} className="start p-0 pr" >Create Assessment</Link>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "2rem" }} >
                <div>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Business:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={business_List || []}
                        onChange={(e) => setSelected_Fields({ business: e.value, course: null, module: null })}
                        value={selected_Fields.business}
                        optionLabel="business_name"
                        placeholder="Select Business" className="pr" />
                </div>
                <div>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Course:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={selected_Fields?.business?.courses || []}
                        onChange={(e) => setSelected_Fields(pre => ({ ...pre, course: e.value, module: null }))} value={selected_Fields.course}
                        optionLabel="course_name"
                        placeholder="Select Course" className="pr" />
                </div>
                <div>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Module:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={selected_Fields?.course?.modules || []}
                        onChange={(e) => setSelected_Fields(pre => ({ ...pre, module: e.value }))}
                        value={selected_Fields.module}
                        optionLabel="module_name"
                        placeholder="Select Module" className="pr" />
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

export default _Assessments;
