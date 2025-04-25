import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Fragment, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
// import { useQuery } from '@tanstack/react-query'; //
import { Tag } from 'primereact/tag';
import { formatDate } from '@/utils/timeFormatter';
import { deleteAdmin_Pedagogy } from '@/api/Super_Admin/qlite/deleteApi';
import { useNavigate } from 'react-router-dom';
import { OverlayPanel } from 'primereact/overlaypanel';

const _DataTable = ({ refreshTableData, isLoading, data, pagination, setPagination }) => {
  const deleteConfirmDialogRef = useRef(null)
  const selectedItemRef = useRef(null)
  const navigate = useNavigate()
  const overLayRef = useRef(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [text, setText] = useState("")

  async function deletePedagogyHandler(id) {
    toast.info("Deleting Pedagogy, Please Wait....")
    try {
      setLocalLoading(true)
      const resp = await deleteAdmin_Pedagogy(id)
      if (!resp.error) {
        toast.success("Pedagogy Deleted Successfully")
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

  const confirmDeleteHandler = () => {
    const _id = selectedItemRef?.current
    if (_id) {
      deletePedagogyHandler(_id)
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

  const textBody = (opt) => {
    return <div style={{ maxHeight: "150px", overflow: "hidden" }}
      onClick={(e) => {
        setText(opt.text)
        overLayRef.current.toggle(e)
      }} dangerouslySetInnerHTML={{ __html: opt.text }}></div>
  }


  const statusBodyTemplate = (opt) => {
    return (
      <Tag severity={opt.pedagogy_status === "ACTIVE" ? "success" : "info"} value={opt.pedagogy_status} />
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
        loading={isLoading || localLoading}
        // header={header}
        emptyMessage="Pedagoggies not found"
        first={pagination.page * pagination.rowsPerPage}
        onPage={onPageChange}
      >
        <Column sortable field={"_id"} header={"Unique Id"} />
        <Column field='title' header={"Title"} />
        <Column body={textBody} field='text' header={"Text"} />
        <Column field='url' header={"URL"} />
        <Column field='updatedAt' body={(opt) => formatDate(opt.updatedAt)} header={"Last Updated"} />
        <Column body={statusBodyTemplate} field='pedagogy_status' header={"Status"} />
        <Column body={actionBodyTemplate} header={"Actions"} />
      </DataTable>
      <OverlayPanel style={{ maxWidth: "600px" }} className='pr' ref={overLayRef}>
        <div dangerouslySetInnerHTML={{ __html: text }}>
        </div>
      </OverlayPanel>
    </>
  );
};

export default _DataTable;
