import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { getAdmin_Business_List_DropDown, getAdmin_CustomerList } from '@/api/Super_Admin/qlite/getApis';
import { Tag } from 'primereact/tag';
import SuperAdminBackButton from '@/components/ui/SuperAdminBackButton';
import "../../Common/styles.scss";
import { Dropdown } from 'primereact/dropdown';
import { createAdminApi_AddLearner } from '@/api/Super_Admin/qlite/createApi';
const obj = {
    "ACTIVE": "success",
    "INACTIVE": "info",
    "ARCHIVED": "danger",
}

const _Add_New_Learner = () => {
    const [data, setData] = useState([])
    const [tableDataLoading, setTableDataLoading] = useState(false)
    // const [subsModelVisible, setSubsModelVisible] = useState(false)
    const [businessList, setBusinessList] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [loading, setLoading] = useState(false);

    async function getCustomerListData(business_Id) {
        try {
            const res = await getAdmin_CustomerList(business_Id)
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

    const getBusinessListData = async () => {
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
        if (selectedBusiness?._id) {
            getCustomerListData(selectedBusiness?._id)
        }
    }, [selectedBusiness?._id])

    useEffect(() => {
        getBusinessListData()
    }, [])


    if (!data) {
        return <p style={{ color: "var(--xp-primary-color)", textAlign: "center" }}> <i className='pi pi-spin pi-spinner'></i> </p>
    }

    const setModelAndLeanerData = async (data) => {
        try {
            if (selectedBusiness?._id && data._id) {
                setLoading(true)
                const body = { user_id: data?._id || null, business_id: selectedBusiness?._id || null }
                const resp = await createAdminApi_AddLearner(body)
                if (resp.error) {
                    throw new Error(resp.data)
                } else {
                    toast.success(resp?.data || "Successfully Staff Added to Training Module.")
                    await getCustomerListData(selectedBusiness?._id)
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
                <div style={{ marginTop: "2rem" }}>
                    <h4 style={{ marginBottom: ".625rem" }}>Select Business:</h4>
                    <Dropdown style={{ minWidth: "400px" }} options={businessList || []} onChange={(e) => setSelectedBusiness(e.value)} value={selectedBusiness}
                        optionLabel="business_name"
                        placeholder="Select Business/Company" className="pr" />
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
                            emptyMessage={selectedBusiness?.business_name + " business each staff have access to training module."}
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
