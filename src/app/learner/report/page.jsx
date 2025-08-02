"use client"
import React from 'react'
import "./styles.scss"
import { Swiper, SwiperSlide } from 'swiper/react'
import { moduleCardsConfig } from '@/components/Technology/swiperConfig'
import { countsAndData } from '@/components/getStatsFunc';
import { get_assessments_result, get_user_learning_stats, getCoursesAndModulesWithStats } from '@/api/get';
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/Loading'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image'
import { cn } from '@/utils/cn'

const fetchCoursesAndModules = async () => {
    const resp = await getCoursesAndModulesWithStats();
    if (resp.error) throw new Error(resp.error);
    return resp;
};

const fetchAssessmentsResult = async () => {
    const resp = await get_assessments_result();
    if (resp.error) throw new Error(resp.error);
    return resp.data;
};

const fetchLearningStats = async () => {
    const resp = await get_user_learning_stats();
    if (resp.error) throw new Error(resp.error);
    return resp.data;
};

const LearningReportPage = () => {
    const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['courses-modules'],
        queryFn: fetchCoursesAndModules,
    });

    const { data: assessmentsResult, isLoading: isLoadingAssessments } = useQuery({
        queryKey: ['assessments-result'],
        queryFn: fetchAssessmentsResult,
    });

    const { data: learningTime, isLoading: isLoadingTime } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: fetchLearningStats,
    });

    if (isLoadingCourses || isLoadingAssessments || isLoadingTime) {
        return (
            <div className='LearningReportPage'>
                <div className="report-section">
                    <h1 className="title">Report</h1>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    const counts = countsAndData(coursesData);
    const incompleteModulesList = counts.allModules.filter((mod) => mod.module_type === "ASSESSMENT");

    const {
        getIdsOfAsmtAndPeda,
        idsOfCompletedModules,
        idsOfCompletedAsmt,
        idsOfCompletedPeda
    } = counts;

    const totalCompletedChildIds = [...idsOfCompletedAsmt, ...idsOfCompletedPeda];

    const countOfWrongAssessments = assessmentsResult.filter((asmt) => !asmt?.isCorrect);
    const countOfCorrectAssessments = assessmentsResult.filter((asmt) => asmt.isCorrect);

    function countMatchedValues(array1, array2) {
        const set2 = new Set(array2);
        const matchedValues = array1.filter(value => set2.has(value));
        return matchedValues.length;
    }

    return (
        <div className='LearningReportPage '>
            <div className="pb-10 pt-6 px-4">
                <h3 className="text-4xl font-bold mb-10 text-center text-[#366494]">Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="py-4 flex flex-col gap-8 mx-auto bg-neutral-100 w-full h-full px-6 rounded-2xl ">
                        <div className=" flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-4xl text-[#366494] ">Overall Score</h3>
                            <p className="text-4xl font-semibold text-green-500"> {(totalCompletedChildIds.length * 100 /
                                getIdsOfAsmtAndPeda.length).toFixed(0)}%</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-2xl">Modules Completed</h3>
                            <p className="text-2xl font-semibold text-green-500">{idsOfCompletedModules.length}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-2xl">Tests Completed</h3>
                            <p className="text-2xl font-semibold text-green-500">{idsOfCompletedAsmt.length}</p>
                        </div>
                    </div>
                    <Link style={{ textDecoration: "none" }} href={"/learner/certificates"}
                        className="flex flex-col justify-center py-4 w-full h-full px-8 rounded-2xl items-center gap-4 bg-pink-200">
                        <Image height={300} width={100} className="h-full" src="/assets/certificate.svg" alt="Certificate" />
                        <p className="font-semibold text-2xl text-pink-500 hover:text-pink-800">Download <br /> Certificates</p>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <div className="py-12 px-6 text-center bg-neutral-100">
                    <h3 className="text-4xl text-orange-600">{countOfWrongAssessments.length}</h3>
                    <p className="text-xl">Wrong Answers</p>
                </div>
                <div className="py-12 px-6 text-center bg-neutral-200">
                    <h3 className="text-4xl text-green-500">{countOfCorrectAssessments.length}</h3>
                    <p className="text-xl">Correct Answers</p>
                </div>
            </div>

            {incompleteModulesList && <div className="course-slider-section">
                <Swiper {...moduleCardsConfig}>
                    {incompleteModulesList.map((mod_data, index) => {
                        const { module_name, assessments, pedagogies, module_type } = mod_data
                        const childs = module_type === "ASSESSMENT" ? assessments : pedagogies
                        const module_complete_child_status = countMatchedValues(childs, idsOfCompletedAsmt)
                        return (
                            <SwiperSlide className='swiper-slide' key={index}>
                                <div onClick={() =>
                                    redirect("/learner/assessment/" + mod_data._id)} className="course-card">
                                    <div className="title">{module_name}</div>
                                    <div className="description">
                                        <p>{childs.length} Assessments </p>
                                        <p>  {module_complete_child_status === 0 ? "0" : (module_complete_child_status * 100 /
                                            childs.length).toFixed(0) || "0"}%
                                            Completed</p>
                                        {/* <p>Score {completedChilds.length == 0 ? "0" : ((completedChilds?.length / childs?.length) * 100)?.toFixed(0) || "0"}% </p> */}
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>}

            <LearningTime totalSeconds={learningTime?.timeSpent || 0} />
            <div className="my-10">
                <Link href="/learner" className={cn("mx-auto block w-fit bg-gray-300",
                    "rounded-4xl text-2xl font-semibold py-3 px-12",
                    "hover:text-white hover:bg-black transition-colors")}>Back to Dashboard</Link>
            </div>
        </div>
    )
}


const LearningTime = ({ totalSeconds }) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const learningTime = {
        days,
        hours,
        minutes,
    };

    return (
        <div className="border-1 mt-8 sm:mt-0 border-neutral-200 grid grid-cols-3 sm:grid-cols-5">
            <div className=" col-span-3 sm:col-span-2 py-[3rem] flex items-center justify-center">
                <h3 className="text-4xl text-pink-700 font-bold">Learning Time</h3>
            </div>
            <div className="col-span-1 py-[3rem] text-center bg-neutral-200">
                <h3 className="text-3xl">{learningTime.days}</h3>
                <p className="text-xl">Days</p>
            </div>
            <div className=" col-span-1 py-[3rem] text-center bg-neutral-100">
                <h3 className="text-3xl">{learningTime.hours}</h3>
                <p className="text-xl">Hours</p>
            </div>
            <div className=" col-span-1 py-[3rem] text-center bg-neutral-200">
                <h3 className="text-3xl">{learningTime.minutes}</h3>
                <p className="text-xl">Minutes</p>
            </div>
        </div>
    );
};

export default LearningReportPage