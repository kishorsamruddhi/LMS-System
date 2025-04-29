"use client";
import AdminBackButton from "@/components/AdminBackButton";
import DataTable from "@/components/Prime/DataTable";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { getAdmin_pedagoggies_by_module_id, getCourses_and_Modules_list } from "@/api/_admin/getApis";
import { useEffect, useState } from "react";
import Dropdown from "@/components/Prime/Dropdown";
import LinkButton from "@/components/LinkButton";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PedagogyPage = () => {
    const ModuleType = "THEORY"
    const searchParams = useSearchParams();
    const queryParams = {
        module_id: searchParams.get("module_id") || null,
        course_id: searchParams.get("course_id") || null
    }
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [courseDropdown, setCourseDropdown] = useState(null)
    const [selectedModule, setSelectedModule] = useState(undefined)
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(null)

    const getTableData = async () => {
        if (!selectedModule) return
        setIsLoading(true);
        setIsError(false);
        try {
            const resp = await getAdmin_pedagoggies_by_module_id(selectedModule);
            if (!resp.error) {
                setData(resp.data.pedagogies);
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
            const course_resp = await getCourses_and_Modules_list(ModuleType);
            if (!course_resp?.error) {
                const { course_id, module_id } = queryParams
                const arr = course_resp.data
                if (course_id) {
                    const item = arr.find(val => val._id == course_id)
                    if (item) {
                        setSelectedCourse(item._id)
                        if (module_id) {
                            const mod_item = item.modules?.find(val => val._id == module_id)
                            if (mod_item) {
                                setSelectedModule(mod_item._id)
                            }
                        }
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
        if (selectedModule) {
            getTableData()
        }
    }, [selectedModule])

    if (isError) return <ErrorPage message={isError || "Something went worng."} />

    const cols = [
        { header: "Unique Id", field: "_id" },
        { header: "Title", field: "title" },
        { header: "Description", field: "text" },
        { header: "Media Url", field: "url" },
        { header: "Pedagogy Type", field: "pedagogy_type" },
    ]

    function ActionBtns(rowData) {
        const nextUrl = `pedagogies/${rowData?._id}?mode=`
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
        data: data || [], columns: cols,
        action: {
            header: "Action",
            body: ActionBtns
        },
    }
    function courseChangeHandler(val) {
        setSelectedCourse(val)
    }
    function moduleChangeHandler(val) {
        setSelectedModule(val)
    }

    const modulesList = Array.isArray(courseDropdown) ? courseDropdown.find(val => val._id === selectedCourse)?.modules : []

    return (
        <div className='p-6'>
            <div style={{ margin: "1rem 0" }} className="div">
                <AdminBackButton style={{ margin: "0" }} />
            </div>

            <div className="my-4 flex justify-between items-center">
                <h1 className="text-2xl">Pedagogies <span className="text-cyan-500">Management</span> </h1>
                <LinkButton href={"pedagogies/add"}>Create Pedagogy</LinkButton>
            </div>
            <div className="flex gap-4 items-center">
                {courseDropdown && courseDropdown.length > 0 ? <Dropdown options={courseDropdown}
                    optionLabel={"course_name"}
                    optionValue={"_id"}
                    onChange={courseChangeHandler}
                    value={selectedCourse}
                    placeholder="Select Course" /> : <Button
                        disabled={true}
                        className="text-red-400 text-sm">You don't have any courses</Button>}
                {selectedCourse && modulesList.length > 0 ? <Dropdown options={modulesList}
                    optionLabel={"module_name"}
                    optionValue={"_id"}
                    onChange={moduleChangeHandler}
                    value={selectedModule}
                    placeholder="Select Module" /> : <Button
                        disabled={true}
                        className="text-red-400 text-sm">Course has 0 module of {ModuleType}</Button>}
            </div>
            <div className="data-table w-full mt-4">
                <div className="overflow-x-auto">
                    <DataTable {...tableProps} />
                </div>
            </div>
        </div>
    );
};


export default PedagogyPage;