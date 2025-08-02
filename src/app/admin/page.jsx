"use client";
import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/Loading';
import ErrorPage from '@/components/ErrorPage';
import Link from 'next/link';
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
        <div className='py-10 px-2'>
            <h2 className='text-4xl text-center mt-4 mb-10'>Welcome <span className='text-cyan-500'>{isAuhtLoading ? "Loading..." : auth?.username}!</span> </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pb-10 border-b-2 border-neutral-300">
                <div className="flex-wrap bg-gradient-to-b from-teal-400 to-cyan-700 rounded-4xl py-6 px-8 flex gap-6 items-center">
                    <img height={180} width={180} className='max-sm:w-30 max-sm:mx-auto' src="/Icons/data-graph.svg" alt="data-graph" />
                    <div className="text-neutral-100 font-semibold">
                        <p>Courses Count: <span className='text-white text-2xl'>{data.coursesCount || "0"}</span></p>
                        <p>Modules Count: <span className='text-white text-2xl'>{data.modulesCount || "0"}</span> </p>
                        <p>Assessments Count: <span className='text-white text-2xl'>{data.assessmentsCount || "0"}</span> </p>
                        <p>Pedagogy Count: <span className='text-white text-2xl'>{data.pedagogyCount || "0"}</span> </p>
                    </div>
                </div>
                <div className="flex-wrap bg-gradient-to-b from-teal-400 to-cyan-700 rounded-4xl py-6 px-8 flex gap-6 items-center">
                    <img height={180} width={180} className='max-sm:w-30 max-sm:mx-auto' src="/Icons/time-graph.svg" alt="time-graph" />
                    <div className="text">
                        <h3 className='text-white' style={{ fontSize: "1.8rem", fontWeight: "600" }}>{timeDetails?.days} Day</h3>
                        <p className='text-neutral-100'>{timeDetails?.hours} Hours - {timeDetails?.minutes} Mins</p>
                        <p className='text-neutral-100'>Spent by Learners</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
                {links.map(({ category, title, link, count }, index) => (
                    <Link href={link} key={index} className=" p-8 rounded-xl  bg-gradient-to-b from-cyan-400 to-cyan-700 shadow-2xl transition-transform hover:scale-[1.04]">
                        <p className='text-white'>{category}</p>
                        <p className='text-2xl font-semibold text-white'>{title}</p>
                        {count && <span
                            className='text-neutral-300'
                            style={{ fontFamily: "monospace", }}>Total Counts: {isNaN(count) ? 0 : count}</span>}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
