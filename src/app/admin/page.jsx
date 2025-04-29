"use client";
import React, { use } from 'react';
import "./styles.scss";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/Loading';
import ErrorPage from '@/components/ErrorPage';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserContext } from '@/store/User_Context';
import { getAllDataCounts } from '@/api/_admin/getApis';

const fetchAllDataCounts = async () => {
    const res = await getAllDataCounts();
    if (res.error) throw new Error(res.error);
    return res.data;
};

const getTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return {
        days: !isNaN(days) ? days : 0,
        hours: !isNaN(hours) ? hours : 0,
        minutes: !isNaN(minutes) ? minutes : 0
    };
};

const AdminDashboard = () => {
    const { auth, isAuhtLoading } = use(UserContext);
    const { data, isLoading, error, isError } = useQuery({
        queryKey: ["training_dashboard_data"],
        queryFn: fetchAllDataCounts,
        staleTime: 15000,
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <ErrorPage message={error.message || "Something went wrong"} />;
    }

    const prefix = "/admin";
    const links = [
        { title: "Learners", category: "Manage", link: `${prefix}/learners`, count: data.learnersCount },
        // { title: "Subscriptions", category: "Manage", link: `${prefix}/subscription`, count: data.subsCount },
        { title: "Courses", category: "Manage", count: data.coursesCount, link: `${prefix}/courses` },
        { title: "Modules", category: "Manage", count: data.modulesCount, link: `${prefix}/modules` },
        { title: "Assessments", category: "Manage", count: data.assessmentsCount, link: `${prefix}/assessments` },
        { title: "Pedagogies", category: "Manage", count: data.pedagogyCount, link: `${prefix}/pedagogies` },
    ];

    const timeDetails = getTime(data.learningTime);
    return (
        <div className='AdminDashboard'>
            <Button asChild className={"border-2 border-gray-300 hover:border-gray-800"}>
                <Link href="/login"><ArrowLeft /></Link>
            </Button>
            <h1 className='text-2xl'>Welcome {isAuhtLoading ? "Loading..." : auth?.username}!</h1>
            <div className="hero-card-section">
                <div className="hero-card">
                    <img height={180} width={180} src="/Icons/data-graph.svg" alt="data-graph" />
                    <div className="text">
                        <p>{data.coursesCount || "0"} Courses</p>
                        <p>{data.modulesCount || "0"} Modules</p>
                        <p>{data.assessmentsCount || "0"} Assessments</p>
                        <p>{data.pedagogyCount || "0"} Pedagogy</p>
                    </div>
                </div>
                <div className="hero-card">
                    <img height={180} width={180} src="/Icons/time-graph.svg" alt="time-graph" />
                    <div className="text">
                        <h3 className='text-white' style={{ fontSize: "1.8rem", fontWeight: "600" }}>{timeDetails?.days} Day</h3>
                        <p>{timeDetails?.hours} Hours : {timeDetails?.minutes} Mins</p>
                        <p>Spent by Learners</p>
                    </div>
                </div>
            </div>
            <div className="dash-wrap">
                {links.map(({ category, title, link, count }, index) => (
                    <Link href={link} key={index} className="card">
                        <p>{category}</p>
                        <h2>{title}</h2>
                        {count && <span style={{ color: "#dadada", fontFamily: "monospace", fontSize: "12px" }}>Total Counts: {isNaN(count) ? 0 : count}</span>}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
