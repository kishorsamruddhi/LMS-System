import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const _DataTable = ({ data, pagination, setPagination }) => {
  const [subsModelVisible, setSubsModelVisible] = useState(false)
  const isLoading = false

  const buySubProps = { subsModelVisible, setSubsModelVisible }
  const setModelAndLeanerData = (data) => {
    setSubsModelVisible(data.user_details)
  }

  const actionBodyTemplate = (data) => {
    return (<div style={{ display: "flex", gap: ".25rem" }}>
      {/* <Button
        onClick={() => setModelAndLeanerData(data)}
        style={{ padding: "10px 15px" }} text raised={true} severity='primary' icon="pi pi-shopping-bag" /> */}
      <Link className='p-button' style={{ whiteSpace: "nowrap", textDecoration: "none", padding: "3px", fontSize: "12px" }} to={"view_report_by_learner_id/" + data.user_details._id}>View Report</Link>
    </div>
    );
  };

  if (isLoading) {
    return <p style={{ color: "var(--xp-primary-color)", textAlign: "center" }}> <i className='pi pi-spin pi-spinner'></i> </p>;
  }

  // Handle page changes
  const onPageChange = (e) => {
    setPagination({
      page: e.page, // Current page (0-based)
      rowsPerPage: e.rows, // Rows per page
    });
  };

  const fullName = (data) => `${data.user_details.firstName} ${data.user_details.lastName}`
  const pack_details = (data) => `${data?.subpack || "NO ACTIVE PLAN"}`

  return (
    <>
      <DataTable
        sortMode="multiple"
        removableSort
        pt={{
          root: { className: "pr" },
          headerRow: { className: "pr" },
        }}
        showGridlines
        value={data}
        paginator
        rows={pagination.rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilterFields={["course_name", "course_desc", "course_code", "course_status"]}
        loading={isLoading}
        emptyMessage="Profiles not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"user_id"} header={"Unique Id"} />
        <Column body={fullName} header={"Full Name"} />
        <Column field={"user_details.email"} header={"Email Address"} />
        <Column field={"user_details.phoneNumber"} header={"Phone Number"} />
        <Column field={"completedModules"} header={"Completed Modules"} />
        <Column field={"completedAssessments"} header={"Completed Assessments"} />
        <Column field={"learning_time.timeSpent"} header={"Leanrning Time"} />
        <Column body={pack_details} header={"Active Plan"} />
        <Column body={actionBodyTemplate} header={"Actions"} />
      </DataTable>
    </>
  );
};

export default _DataTable;
