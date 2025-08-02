"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { updateAdmin_Pedagogy } from "@/api/_admin/updateApi";
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { BtnWithLoading } from "@/components/TailwindBtn";
import EditViewPageHeader from "@/components/admin/EditViewPageHeader";

const Actions = ({ formValues = {} }) => {
    const { module_id, course_id, text, url, title, updatedAt } = formValues
    const modId = module_id?._id

    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { text, url, title, }
    });

    async function onSubmit(data) {
        if (!editMode) return
        const { text, url, title, } = data
        try {
            if (isLoading) return
            setIsLoading(true)
            const resp = await updateAdmin_Pedagogy({ text, url, title, _id: formValues._id });
            if (!resp.error) {
                toast.success(`Pedagogy updated successfully!!!`);
                setTimeout(() => {
                    redirect(`/admin/pedagogies?course_id=${course_id}&module_id=${modId}`)
                }, 1200);
            } else {
                toast.error(resp?.data || "Unknown Error");
                setTimeout(() => {
                    throw new Error(resp?.data || "Unknown Error")
                }, 1200);
            }
        } catch (error) {
            toast.error(error.message);
            setTimeout(() => {
                throw new Error(error.message)
            }, 1200);
        }
        finally {
            setIsLoading(false)
        }
    }

    const FormField = ({ label, type, registerKey, options = { required: true }, errorMessage = "", inputStyle = {} }) => {
        return (
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">{label}</label>
                <Input
                    className={"font-light"}
                    disabled={!editMode}
                    type={type}
                    style={inputStyle}
                    {...register(registerKey, options)}
                />
                {errors[registerKey] && <span className="text-sm text-red-400">{errors[registerKey]?.message || "This field is required"}</span>}
            </div>
        );
    };

    function toggleMode() {
        setEditMode(prev => !prev)
    }

    return (<div style={{ padding: "2rem" }}>
        <EditViewPageHeader
            backBtnPath={`/pedagogies?course_id=${course_id}&module_id=${modId}`}
            headText={editMode ? "Updating" : "Viewing"}
            title={"Pedagogy"}
            toggler={toggleMode}
            time={updatedAt}
            editMode={editMode}
        />
        <div className="flex gap-4">
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">Course Name:</label>
                <Input
                    className={"font-light"}
                    readOnly
                    disabled={true}
                    value={module_id?.course_id?.course_name} />
            </div>
            <div className="flex flex-col mt-4">
                <label className="text-sm text-gray-600">Module Name:</label>
                <Input
                    className={"font-light"}
                    readOnly
                    disabled={true}
                    value={module_id?.module_name} />
            </div>
        </div>
        <form style={{ minWidth: "unset", maxWidth: "unset", }} onSubmit={handleSubmit(onSubmit)}>
            {FormField({ register, errors, label: "Title:", fieldType: "text", registerKey: "title" })}
            {FormField({ register, errors, label: "Video Url:", fieldType: "text", registerKey: "url" })}
            <div className="flex flex-col  mt-4">
                <label className="text-sm text-gray-600">Text:</label>
                <TextQuillField textValue={text} register={register} setValue={setValue} />
                {errors?.text && <span className="text-sm text-red-400">{errors?.text?.message || "This field is required"}</span>}
            </div>
            <div className="mt-4">
                <BtnWithLoading isLoading={isLoading} label={"Update Pedagogy"} disabled={isLoading || !editMode}
                    type="submit" loadingLable={"Updating Pedagogy"} />
            </div>
        </form>
    </div>
    );
};


const TextQuillField = ({ textValue = "", setValue }) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useLayoutEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                    ],
                },
                formats: ['header', 'bold', 'italic', 'underline', 'list'],
            });

            quillRef.current.on('text-change', () => {
                const html = editorRef.current.querySelector('.ql-editor').innerHTML;
                setValue("text", html);
            });

            if (textValue.length > 0) {
                quillRef.current.clipboard.dangerouslyPasteHTML(textValue);
            }

        }
    }, []);

    return (
        <div ref={editorRef} />
    );
};

export default Actions;
