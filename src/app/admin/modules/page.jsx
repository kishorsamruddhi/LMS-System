"use client";
import AdminBackButton from "@/components/AdminBackButton";
import Link from "next/link";
import DataTable from "@/components/Prime/DataTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { getAdmin_Course_List_DropDown, getAdmin_modules_by_courseId } from "@/api/_admin/getApis";
import { useEffect, useState } from "react";
import Dropdown from "@/components/Prime/Dropdown";
import ErrorPage from "@/components/ErrorPage";
import { useSearchParams } from "next/navigation";
import { tailwindBtnClasses } from "@/components/TailwindBtn";

const Module = () => {
    const searchParams = useSearchParams();
    const course_id = searchParams.get("course_id") || null
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseDropdown, setCourseDropdown] = useState(null)
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(null)

    const getTableData = async () => {
        if (!selectedCourse) return
        setIsLoading(true);
        setIsError(false);
        try {
            const resp = await getAdmin_modules_by_courseId(selectedCourse);
            if (!resp.error) {
                setData(resp.data.modules);
            } else {
                setIsError(resp.data);
            }
        } catch (error) {
            console.error(error.message);
            setIsError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getCoursesList = async () => {
        try {
            const course_resp = await getAdmin_Course_List_DropDown();
            if (!course_resp?.error) {
                const arr = course_resp.data
                if (course_id) {
                    const item = arr.find(val => val._id == course_id)
                    if (item) {
                        setSelectedCourse(item._id)
                    }
                } else {
                    setSelectedCourse(arr[0]?._id)
                }
                setCourseDropdown(arr);
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(error.message);
        }
    };

    useEffect(() => {
        getCoursesList()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            getTableData(selectedCourse)
        }
    }, [selectedCourse])

    if (isError) return <ErrorPage message={isError || "Something went worng."} />

    const tableData = data || []
    const cols = [
        { header: "Unique Id", field: "_id" },
        { header: "Module Name", field: "module_name" },
        { header: "Module Description", field: "module_desc" },
        { header: "Module Code", field: "module_code" },
        { header: "Module Type", field: "module_type" },
        { header: "Module Seq No", field: "module_seq_no" },
    ]

    function ActionBtns(rowData) {
        const nextUrl = `modules/${rowData?._id}?mode=`
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
    function courseChangeHandler(val) {
        setSelectedCourse(val)
    }

    return (
        <div className='p-6'>
            <div style={{ margin: "1rem 0" }} className="div">
                <AdminBackButton style={{ margin: "0" }} />
            </div>

            <div className="my-4 flex justify-between items-center">
                <h1 className="text-2xl">Module <span className="text-cyan-500">Management</span> </h1>
                <Link className={tailwindBtnClasses} href={"modules/add"}>Create Module</Link>
            </div>
            <div >
                {courseDropdown && courseDropdown.length > 0 ? <Dropdown options={courseDropdown}
                    optionLabel={"course_name"}
                    optionValue={"_id"}
                    onChange={courseChangeHandler}
                    value={selectedCourse}
                    placeholder="Select an option" />
                    : <Button
                        disabled={true}
                        className="text-red-400 text-sm">You don't have any courses</Button>}
            </div>
            <div className="data-table w-full mt-4">
                <div className="overflow-x-auto">
                    <DataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};


export default Module;