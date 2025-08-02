import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

export default function TextQuillField({ setValue }) {
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && quillRef.current === null) {
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

            quillRef.current.on('text-change', (e) => {
                const html = editorRef.current.querySelector('.ql-editor').innerHTML;
                setValue("text", html);
            });
        }
    }, []);

    return (
        <div ref={editorRef} />
    );
};
