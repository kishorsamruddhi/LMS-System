import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';


const _DataTable = ({ setEdit, setDialogVisibility, data, pagination, setPagination }) => {

  const isLoading = false

  if (isLoading) {
    return <p style={{ color: "var(--xp-primary-color)", textAlign: "center" }}> <i className='pi pi-spin pi-spinner'></i> </p>;
  }

  const onPageChange = (e) => {
    setPagination({
      page: e.page, // Current page (0-based)
      rowsPerPage: e.rows, // Rows per page
    });
  };

  const setModelAndLeanerData = (data) => {
    setEdit(data)
    setDialogVisibility(data)
  }

  const actionBodyTemplate = (data) => {
    return (<div style={{ display: "flex", gap: ".25rem" }}>
      <Button
        onClick={() => setModelAndLeanerData(data)}
        style={{ padding: "10px 15px" }} text raised={true} severity='primary'
        icon="pi pi-pencil" />
    </div>
    );
  };

  const coursesBody = (data) => data?.courses?.length
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
        loading={isLoading}
        // header={header}
        emptyMessage="Data not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"_id"} header={"Unique Id"} />
        <Column field='business_name' header={"Business Name"} />
        <Column field='email' header={"Email"} />
        <Column field='phone' header={"Mobile Number"} />
        {/* <Column field='category' header={"Category"} /> */}
        {/* <Column body={coursesBody} header={"Courses"} /> */}
        {/* <Column field='business_desc' header={"Description"} /> */}
        <Column body={actionBodyTemplate} header={"Action"} />
      </DataTable>
    </>
  );
};

export default _DataTable;
