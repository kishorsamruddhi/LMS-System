"use client";
import "../_components/styles.scss";
import _DataTable from "./DataTable";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/Loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdmin_Business_List_DropDown, getAdmin_learners_report_datatable } from "@/api/_admin/getApis";
import Dropdown from "@/components/Prime/Dropdown";

function SuperAdminBackButton() {
    return <Button asChild>
        <Link href={"/TrainingDashboard"}>
            <ArrowLeft />
        </Link>
    </Button>
}

const _Learners = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisibility, setDialogVisibility] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [businessList, setBusinessList] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });


    const getTableData = async (id) => {
        try {
            const resp = await getAdmin_learners_report_datatable(id);
            if (!resp.error) {
                setData(resp.data)
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
    }, [])

    useEffect(() => {
        if (selectedBusiness?._id) {
            getTableData(selectedBusiness?._id)
        }
    }, [selectedBusiness?._id])


    useEffect(() => {
        if (!dialogVisibility && isEdit) {
            setEdit(false)
        }
    }, [dialogVisibility]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <h1>Error fetching courses data. Please try again later.</h1>;
    }

    const tableProps = { data, pagination, setPagination, setEdit, isEdit, setDialogVisibility, selectedBusiness, setSelectedBusiness }
    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <SuperAdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Learners Management</h1>
                <Link to={"add_new"} style={{
                    textDecoration: "none",
                    padding: "4px 12px"
                }} className="button start p-0 pr">Add New Learner</Link>
            </div>
            <div style={{ marginTop: "2rem" }}>
                <h4 style={{ marginBottom: ".625rem" }}>Select Business:</h4>
                <Dropdown style={{ minWidth: "400px" }} options={businessList || []} onChange={(e) => setSelectedBusiness(value)} value={selectedBusiness}
                    optionLabel="business_name"
                    placeholder="Select Business/Company" />
            </div>


            <div className="data-table">
                <div className="table">
                    <_DataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};


export default _Learners;
