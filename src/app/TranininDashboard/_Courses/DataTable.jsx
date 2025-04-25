import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { deleteAdminCourse } from '@/api/Super_Admin/qlite/deleteApi';
import { useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';

function getFiltered_CustomersProfile(params) {
  return null
}

const _DataTable = ({ isLoading, refreshTableData, data, pagination, setPagination }) => {
  const deleteConfirmDialogRef = useRef(null)
  const selectedItemRef = useRef(null)
  const navigate = useNavigate()
  const [localLoading, setLocalLoading] = useState(false)
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'course_name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_code': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_desc': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_status': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });


  async function deleteCourseHandler(id) {
    toast.info("Deleting Course, Please Wait....")
    try {
      setLocalLoading(true)
      const resp = await deleteAdminCourse(id)
      if (!resp.error) {
        toast.success("Course Deleted Successfully")
        setLocalLoading(false)
        refreshTableData()
      }
      else {
        toast.error(resp?.data || "Error: Something went wrong!!!")
      }
    } catch (error) {
      toast.error(error.message)
    }
    finally {
      cancelModelHandler()
    }
  }

  const statusBodyTemplate = (data) => {
    return (
      <Tag severity={data.course_status === "ACTIVE" ? "success" : "info"} value={data.course_status} />
    );
  };

  const popUphandler = (e, data) => {
    selectedItemRef.current = data._id
    deleteConfirmDialogRef.current.toggle(e)
  }

  const confirmDeleteHandler = () => {
    const _id = selectedItemRef?.current
    if (_id) {
      deleteCourseHandler(_id)
    }
  }

  function cancelModelHandler() {
    selectedItemRef.current = null
    deleteConfirmDialogRef.current.hide()
  }

  const actionBodyTemplate = (data) => {
    return (<div style={{ display: "flex", gap: ".25rem" }}>
      <Button text raised onClick={() => navigate("update/" + data._id)} icon="pi pi-pencil" />
      <Button
        onClick={(e) => popUphandler(e, data)} severity='danger' text raised icon="pi pi-trash" />
    </div>
    );
  };

  // const header = renderHeader();

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


  return (
    <>
      <OverlayPanel className='pr' ref={deleteConfirmDialogRef}>
        <div>
          <h3 style={{ marginTop: "0px" }}>Are you sure you want to proceed?</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
            <Button
              onClick={confirmDeleteHandler}
              style={{ padding: "6px 12px" }} severity='danger' label='Delete' />
            <Button onClick={cancelModelHandler} style={{ padding: "6px 12px" }} severity='secondary' label='Cancel' />
          </div>
        </div>
      </OverlayPanel>
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
        loading={isLoading || localLoading}
        // header={header}
        filters={filters}
        filterDisplay="row"
        emptyMessage="Profiles not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"_id"} header={"Unique Id"} />
        <Column field='course_name' header={"Course Name"} />
        <Column field='course_code' header={"Code"} />
        <Column field='course_desc' header={"Description"} />
        <Column field={"course_pack_id.plan_code"} header={"Plan Code"} />
        <Column body={statusBodyTemplate} header={"Status"} />
        {/* <Column field='updatedAt' body={(opt) => formatDate(opt.updatedAt)} header={"Last Updated"} /> */}
        <Column body={actionBodyTemplate} header={"Actions"} />
      </DataTable>
    </>
  );
};

export default _DataTable;
