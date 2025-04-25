import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Fragment, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
// import { useQuery } from '@tanstack/react-query'; //
import { Tag } from 'primereact/tag';
import { formatDate } from '@/utils/timeFormatter';
import { deleteAdmin_Assessment } from '@/api/Super_Admin/qlite/deleteApi';
import { useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';

const _DataTable = ({ refreshTableData, isLoading, data, pagination, setPagination }) => {
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false)
  const deleteConfirmDialogRef = useRef(null);
  const selectedItemRef = useRef(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'course_name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_code': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_desc': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_status': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });


  async function deleteAssmtHandler(id) {
    try {
      setLocalLoading(true)
      toast.info("Deleting Assessment, Please Wait....")
      const resp = await deleteAdmin_Assessment(id)
      if (!resp.error) {
        toast.success("Assessment Deleted Successfully")
        setLocalLoading(false)
        setTimeout(() => {
          refreshTableData()
        }, 400);
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

  const popUphandler = (e, data) => {
    selectedItemRef.current = data._id
    deleteConfirmDialogRef.current.toggle(e)
  }

  const confirmDeleteHandler = async () => {
    const _id = selectedItemRef?.current
    if (_id) {
      await deleteAssmtHandler(_id)
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
        onClick={(e) => popUphandler(e, data)}
        severity='danger' text raised icon="pi pi-trash" />
    </div>
    );
  };

  // const header = renderHeader();

  // Handle page changes
  const onPageChange = (e) => {
    setPagination({
      page: e.page, // Current page (0-based)
      rowsPerPage: e.rows, // Rows per page
    });
  };

  const optionsBody = (data) => {
    return <Fragment>
      {data.options.join(", ")}
    </Fragment>
  }

  const statusBodyTemplate = (data) => {
    return (
      <Tag severity={data.assessment_status === "PUBLISHED" ? "success" : "info"} value={data.assessment_status} />
    );
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
        emptyMessage="Assessments not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"_id"} header={"Unique Id"} />
        <Column field='primary_text' header={"Primary Text"} />
        <Column body={optionsBody} header={"Options"} />
        <Column field='correct_option' header={"Correct Option"} />
        <Column body={statusBodyTemplate} field='assessment_status' header={"Status"} />
        <Column field='updatedAt' body={(opt) => formatDate(opt.updatedAt)} header={"Last Updated"} />
        <Column body={actionBodyTemplate} header={"Actions"} />
      </DataTable>
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

export default _DataTable;
