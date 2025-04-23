import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import SuperAdminBackButton from '@/components/ui/SuperAdminBackButton';
import "../Common/styles.scss";
import { getAdmin_getStaffList, getAdmin_addStaffToLearner } from '../../Api/get';
import { Link } from 'react-router-dom';
const obj = {
    "ACTIVE": "success",
    "INACTIVE": "info",
    "ARCHIVED": "danger",
}

const _Add_New_Learner = () => {
    const [data, setData] = useState([])
    const [tableDataLoading, setTableDataLoading] = useState(false)
    const [loading, setLoading] = useState(false);

    async function getCustomerListData() {
        try {
            const res = await getAdmin_getStaffList()
            if (!res.error) {
                const getform = res.data
                if (res.data.length == 0) {
                    toast.info("Every staff have access to training module.")
                }
                setData(getform)
            }
        } catch (error) {
            toast.error(error.message)
        }
        finally {
            setTableDataLoading(false)
        }
    }

    useEffect(() => {
        getCustomerListData()
    }, [])


    if (!data) {
        return <p style={{ color: "var(--xp-primary-color)", textAlign: "center" }}> <i className='pi pi-spin pi-spinner'></i> </p>
    }

    const setModelAndLeanerData = async (data) => {
        try {
            if (data._id) {
                setLoading(true)
                const body = { user_id: data?._id || null }
                const resp = await getAdmin_addStaffToLearner(body)
                if (resp.error) {
                    throw new Error(resp.data)
                } else {
                    toast.success(resp?.data || "Successfully Staff Added to Training Module.")
                    await getCustomerListData()
                }
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const renderHeader = () => {
        return (
            <>
                <h4>Add Learners</h4>
                <div style={{ display: "flex", gap: "1rem" }} className="right-section">
                    <Link to={"/dashboard/User_Management/CreateStaffToken"}
                        style={{ textDecoration: "none", padding: "4px 12px" }}
                        className="p-button">  Add Staff</Link>
                </div>
            </>
        );
    };

    const header = renderHeader()

    const actionBodyTemplate = (data) => {
        return <>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className='actions'>

                <Button
                    onClick={() => setModelAndLeanerData(data)}
                    style={{ padding: "4px 15px" }}
                    size='small'
                    loading={loading}
                    disabled={loading}
                    raised={true} severity='primary'
                    //   /icon="pi pi-shopping-bag"
                    label='Unlock Training Module'
                />

            </div>
        </>
    };

    const statusBodyTemplate = (data) => {
        return (
            <Tag severity={obj[data?.status] || "info"} value={data.status} />
        );
    };
    const fullName = (data) => `${data.firstName} ${data.lastName}`

    return (
        <>

            <div className='SuperAdmin'>
                <div style={{ margin: "1rem 0" }} className="div">
                    <SuperAdminBackButton style={{ margin: "0" }} />
                </div>
                <div className="data-table">
                    <div className="table">
                        <DataTable sortMode="multiple"
                            removableSort
                            pt={{
                                root: { className: "pr" },
                                headerRow: { className: "pr" },
                            }} showGridlines value={data} paginator rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            globalFilterFields={["email", "firstName", "lastName", "phoneNumber"]}
                            loading={tableDataLoading}
                            header={header}
                            // filters={filters}
                            // filterDisplay="row"
                            emptyMessage={"Each staff have access to training module."}
                        >
                            <Column sortable field={"_id"} header={"Unique Id"} />
                            <Column body={fullName} header={"Full Name"} />
                            <Column field={"email"} header={"Email Address"} />
                            <Column field={"phoneNumber"} header={"Phone Number"} />
                            <Column body={statusBodyTemplate} field='status' header={"Status"} />
                            <Column body={actionBodyTemplate} header={"Actions"} />
                        </DataTable>
                    </div>
                </div>
            </div>

        </>
    );
};


function filterPayload(obj) {
    let x = {};
    for (let key in obj) {
        if (obj[key] !== "") {
            x[key] = obj[key];
        }
    }
    return x;
}

export default _Add_New_Learner;
