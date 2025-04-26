import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { formatDate } from '@/utils/timeFormatter';
import { deleteAdminModule } from '@/api/Super_Admin/qlite/deleteApi';
import { useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';

const _DataTable = ({ refreshTableData, isLoading, data, pagination, setPagination }) => {
  const navigate = useNavigate()
  const deleteConfirmDialogRef = useRef(null)
  const [localLoading, setLocalLoading] = useState(false)
  const selectedItemRef = useRef(null)

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'course_name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_code': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_desc': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'course_status': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });


  async function deleteModuleHandler(id) {
    try {
      setLocalLoading(true)
      toast.info("Deleting Module, Please Wait....")
      const resp = await deleteAdminModule(id)
      if (!resp.error) {
        toast.success("Module Deleted Successfully")
        setLocalLoading(false)
        setTimeout(() => {
          refreshTableData()
        }, 300);
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

  const actionBodyTemplate = (data) => {
    return (<div style={{ display: "flex", gap: ".25rem" }}>
      <Button text raised onClick={() => navigate("update/" + data._id)} icon="pi pi-pencil" />
      <Button onClick={(e) => popUphandler(e, data)} severity='danger' text raised icon="pi pi-trash" />
    </div>
    );
  };

  const confirmDeleteHandler = () => {
    const _id = selectedItemRef?.current
    if (_id) {
      deleteModuleHandler(_id)
    }
  }

  function cancelModelHandler() {
    selectedItemRef.current = null
    deleteConfirmDialogRef.current.hide()
  }

  // const header = renderHeader();

  // Handle page changes
  const onPageChange = (e) => {
    setPagination({
      page: e.page, // Current page (0-based)
      rowsPerPage: e.rows, // Rows per page
    });
  };

  const calcChilds = (data) => {
    const isAssessment = data.module_type === "ASSESSMENT" ? true : false;
    const childLength = isAssessment ? data.assessments.length : data.pedagogies.length

    return `${childLength}`
  }

  return (
    <>
      <OverlayPanel className='pr' ref={deleteConfirmDialogRef}>
        <div>
          <h3 style={{ marginTop: "0px" }}>Are you sure you want to proceed?</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
            <Button
              onClick={confirmDeleteHandler}
              style={{ padding: "6px 12px" }} severity='danger' label='Delete' />
            <Button
              onClick={(e) => popUphandler(e, data)}
              severity='danger' text raised icon="pi pi-trash" />
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
        emptyMessage="Modules not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"_id"} header={"Unique Id"} />
        <Column field='module_name' header={"Module Name"} />
        <Column field='module_code' header={"Module Code"} />
        <Column field='module_desc' header={"Description"} />
        <Column field='module_type' header={"Module Type"} />
        <Column body={calcChilds} header={"Childs Count"} />
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
