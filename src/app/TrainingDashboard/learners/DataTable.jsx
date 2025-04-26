import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Link } from 'react-router-dom';

const _DataTable = ({ data, pagination, setPagination, selectedBusiness }) => {
  const isLoading = false

  const actionBodyTemplate = (learner) => {
    console.log(learner);
    if (!learner?.user_details) {
      return null

    }
    return (<div style={{ display: "flex", gap: ".25rem" }}>
      <Link className='p-button ' style={{ whiteSpace: "nowrap", textDecoration: "none", fontWeight: "bold", padding: "6px", fontSize: "12px" }} to={"view_report_by_learner_id/" + learner?.user_details?._id}>View Report</Link>
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

  const fullName = (learner) => `${learner?.user_details?.firstName} ${learner?.user_details?.lastName}`
  const pack_details = (learner) => {
    const plan = learner?.subpack?.plan || "NO ACTIVE PLAN"
    return plan
  }

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
        <Column body={pack_details} header={"Active Plans"} />
        <Column body={actionBodyTemplate} header={"Actions"} />
      </DataTable>
    </>
  );
};

export default _DataTable;
