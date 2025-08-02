"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/Loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { getAdmin_learners_report_datatable } from "@/api/_admin/getApis";
import DataTable from "@/components/Prime/DataTable";
import AdminBackButton from "@/components/AdminBackButton";
import { tailwindBtnClasses } from "@/components/TailwindBtn";

const _Learners = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisibility, setDialogVisibility] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });
    async function getTableData() {
        try {
            const resp = await getAdmin_learners_report_datatable();
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

    useEffect(() => {
        getTableData()
    }, [])

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

    const cols = [
        { header: "Unique Id", field: "user_id" },
        { header: "Username", field: "user_details.username" },
        { header: "Email", field: "user_details.email" },
        { header: "Phone", field: "user_details.phoneNumber" },
        { header: "Completed Modules", field: "completedModules" },
        { header: "Completed Assessments", field: "completedAssessments" },
        { header: "Completed Assessments", field: "completedAssessments" },
    ]

    function ViewButton(rowData) {
        return <Button asChild>
            <Link href={"learners/" + rowData?.user_id}>
                <Eye />
            </Link>
        </Button>
    }

    const tableProps = {
        data: data || [], columns: cols,
        action: {
            header: "View Report",
            body: ViewButton
        },
        pagination, setPagination, setEdit, isEdit, setDialogVisibility
    }

    return (
        <div className='p-6'>
            <div style={{ margin: "1rem 0" }} className="div">
                <AdminBackButton style={{ margin: "0" }} />
            </div>
            <div className="my-4 flex justify-between items-center">
                <h1 className="text-2xl">Learners  <span className='text-cyan-500'>Management</span>  </h1>
                <Link className={tailwindBtnClasses} href={"learners/add"}>Add New Module</Link>
            </div>
            {data && <div className="data-table">
                <div className="overflow-x-auto">
                    <DataTable {...tableProps} />
                </div>
            </div>}
        </div>
    );
};


export default _Learners;
