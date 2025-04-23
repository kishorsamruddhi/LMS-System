import "./Common/styles.scss";
import _DataTable from "./DataTable";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/Loading";
import LinkBackButton from "@/components/ui/LinkBackButton";
import { getAdmin_learners_report_datatable } from "../Api/get";
import { Link, useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

const _Admin_of_Learners = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisibility, setDialogVisibility] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });


    const getCoursesData = async () => {
        try {
            const resp = await getAdmin_learners_report_datatable();
            if (!resp.error) {
                setData(resp.data)
            } else {
                setIsError(resp.data);
            }
        } catch (error) {
            setIsError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCoursesData()
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
        throw new Error(isError);
    }

    const tableProps = { data, pagination, setPagination, setEdit, isEdit, setDialogVisibility }
    return (
        <div className='SuperAdmin'>
            <div style={{ margin: "1rem 0" }} className="div">
                <LinkBackButton path="/dashboard" style={{ margin: "0" }} />
            </div>
            <div className="header">
                <h1>Learners Management</h1>
                <Link to={"add_learner"} style={{
                    textDecoration: "none",
                    padding: "4px 12px"
                }} className="button start p-0 pr">Add Learners</Link>
            </div>
            <div className="data-table">
                <div className="table">
                    <_DataTable {...tableProps} />
                </div>
            </div>
            <AddStaffDialog />
        </div>
    );
};


function AddStaffDialog() {
    const [visible, setVisible] = useState(false);
    const nav = useNavigate()
    function gotToAddStaff() {
        nav("/dashboard/User_Management/CreateStaffToken")
    }
    return (
        <div>
            <Button style={{ position: "absolute", bottom: "2rem", left: "2rem" }} className="pr " label="Add Staff Help" severity="help" icon="pi pi-question-circle" onClick={() => setVisible(true)} />
            <Dialog header="Add Staff Help" visible={visible} className="pr" style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                    <h2 >
                        Add staff for them to access training service
                    </h2>
                    <br />
                    <Button onClick={gotToAddStaff}>Add Staff</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default _Admin_of_Learners;
