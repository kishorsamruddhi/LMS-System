"use client"

import React, { useState, useEffect, use } from 'react';
import "./styles.scss";
import ThePDF_Container from './pdf';
import { downloadCompletedCourseById } from '@/api/get';
import LoadingSpinner from '@/components/Loading';
import ErrorPage from '@/components/ErrorPage';

export default function CoursesCertificatePdf({ params }) {
    const { course_id } = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await downloadCompletedCourseById(course_id);
                if (result.error) {
                    setError(result.data);
                }
                else {
                    setData(result);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorPage message={error} />;
    }

    return (
        <div className="certificate-container">
            <div className="certificate-content">
                {data?.data && <ThePDF_Container data={data} />}
            </div>
        </div>
    );
}
