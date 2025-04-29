
import AdminBackButton from "@/components/AdminBackButton";
import Link from "next/link";
import { cookies } from "next/headers";
import { backendLink, cookiesKey } from "@/utils/token";
import DataTable from "@/components/Prime/DataTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

const _Courses = async () => {
    try {
        const ck = (await cookies())?.get(cookiesKey)?.value
        const reqUrl = backendLink + "admin/get/courses"
        const resp = await fetch(reqUrl, {
            headers: {
                Authorization: `Bearer ${ck}`,
            }
        })
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const data = await resp.json()
        if (data.error) {
            throw new Error(data.data);
        }
        const tableData = data?.data || []
        const cols = [
            { header: "Unique Id", field: "_id" },
            { header: "Course", field: "course_name" },
            { header: "Course Description", field: "course_desc" },
            { header: "Course Code", field: "course_code" },
            { header: "Card Color", field: "color", body: renderColor },
            { header: "Status", field: "course_status" },
        ]

        function renderColor(value) {
            return <p style={{ height: "20px", width: "20px", borderRadius: "3px", backgroundColor: value }}></p>
        }

        function ActionBtns(rowData) {
            const nextUrl = `courses/${rowData?._id}?mode=`
            return <div className="flex gap-2">
                <Button asChild>
                    <Link href={nextUrl + "view"}>
                        <Eye />
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={nextUrl + "edit"}>
                        <Pencil />
                    </Link>
                </Button>
            </div>
        }

        const tableProps = {
            data: tableData, columns: cols,
            action: {
                header: "Action",
                body: ActionBtns
            },
        }

        return (
            <div className='p-6'>
                <div style={{ margin: "1rem 0" }} className="div">
                    <AdminBackButton style={{ margin: "0" }} />
                </div>

                <div className="my-4 flex justify-between items-center">
                    <h1 className="text-2xl">Courses <span className="text-cyan-500">Management</span> </h1>
                    <Button
                        className="hover:text-cyan-500"
                    >
                        <Link href={"courses/add"}
                        >Create Course</Link>
                    </Button>
                </div>
                <div className="data-table w-full">
                    <div className="overflow-x-auto">
                        {tableData.length > 0 ? <DataTable {...tableProps} /> : <p>O records found.</p>}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return <h1>
            {error.message}
        </h1>
    }
};


export default _Courses;