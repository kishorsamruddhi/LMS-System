"use client"

import React from 'react';
import "./styles.scss";
import { useQuery } from '@tanstack/react-query';
import { getCompletedCourses } from '@/api/get';
import LoadingSpinner from '@/components/Loading';
import ErrorPage from '@/components/ErrorPage';
import Link from 'next/link';
import { tailwindBtnClasses } from '@/components/TailwindBtn';

const fetchCompletedCourses = async () => {
    const resp = await getCompletedCourses();
    if (resp?.error) throw new Error(resp.error);
    return resp.data;
};

const CoursesCertificates = () => {
    const { data, isLoading, error, isError } = useQuery({
        queryKey: ["completed_courses"],
        queryFn: fetchCompletedCourses,
        "staleTime": 4 * 60 * 1000
    });

    if (isLoading) {
        return (
            <div className="CoursesCertificates">
                <h2>My Certificates</h2>
                <LoadingSpinner height='calc(60vh - 2rem)' />
            </div>
        );
    }

    if (isError) {
        return <ErrorPage message={error?.message || "Something went wrong"} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="CoursesCertificates">
                <h2>My Certificates</h2>
                {/* <h3>Click to download the certificates.</h3> */}
                <h1 style={{ color: "red", marginTop: "4rem" }}>
                    You have not completed any courses yet.
                </h1>
                <GoToCoursesButton />
            </div>
        );
    }

    return (
        <div className="CoursesCertificates">
            <h2>My Certificates</h2>
            <h3>Click to download the certificates.</h3>
            <div className="courses-list">
                {data.map(({ course_id }) => (
                    <Link key={course_id._id} href={"/learner/certificates/" + course_id._id} className="card">
                        <img src="/assets/badge-medal.svg" alt="Certificate Badge" />
                        <h3>{course_id.course_name}</h3>
                    </Link>
                ))}
            </div>
            <Link className={tailwindBtnClasses} href={"learner/my-courses"}> Go to Courses Page</Link>
        </div>
    );
};

export default CoursesCertificates;
