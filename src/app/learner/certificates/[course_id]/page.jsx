"use client"

import React, { use, Fragment } from 'react';
import "./styles.scss";
import { downloadCompletedCourseById } from '@/api/get';
import LoadingSpinner from '@/components/Loading';
import ErrorPage from '@/components/ErrorPage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import PageNotFound from '@/components/PageNotFound/PageNotFound';
import ThePDF_Container from './_components/pdf';

export default function CoursesCertificatePdf({ params }) {
    const { course_id } = use(params);
    const {
        data,
        isError,
        isLoading,
        error
    } = useQuery({
        queryKey: ["download_Course", course_id],
        queryFn: () => downloadCompletedCourseById(course_id),
        staleTime: 60 * 1000 * 5,
        gcTime: 60 * 1000 * 10,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false
    })


    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError || !data?.data) {
        return <ErrorPage message={error} />;
    }

    return (
        <Fragment>

            <div className="certificate-container">
                <Button className={"mb-4"} asChild>
                    <Link href={"/learner/certificates"}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <div className="certificate-content">
                    <LoadPDF data={data} />
                </div>
            </div>
        </Fragment>
    );
}

function LoadPDF({ data }) {
    try {
        return <ThePDF_Container data={data} />
    } catch (error) {
        return <PageNotFound errorMessage={"Currently this service is getting some error. Please try again later."} />
    }
}