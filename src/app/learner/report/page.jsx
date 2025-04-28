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
        <div className='LearningReportPage'>
            <div className="report-section">
                <h1 className="title">Reports</h1>
                <div className="stats-container">
                    <div className="stat-column">
                        <div className="stat-item overallScore">
                            <h3 className="stat-label-text ">Overall Score</h3>
                            <p className="stat-value-text"> {(totalCompletedChildIds.length * 100 /
                                getIdsOfAsmtAndPeda.length).toFixed(0)}%</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-label-text">Modules Completed</h3>
                            <p className="stat-value-text">{idsOfCompletedModules.length}</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-label-text">Tests Completed</h3>
                            <p className="stat-value-text">{idsOfCompletedAsmt.length}</p>
                        </div>
                    </div>
                    <Link style={{ textDecoration: "none" }} href={"/training/certificates"} className="download-column">
                        <img className="img" src="/assets/certificate.svg" alt="Certificate" />
                        <p className="text">Download <br /> Certificates</p>
                    </Link>
                </div>
            </div>

            <div className="answer-wrap">
                <div className="answer-card wrong-answer">
                    <h3 className="wrong-count">{countOfWrongAssessments.length}</h3>
                    <p className="answer-label">Wrong Answers</p>
                </div>
                <div className="answer-card correct-answer">
                    <h3 className="correct-count">{countOfCorrectAssessments.length}</h3>
                    <p className="answer-label">Correct Answers</p>
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
                                    redirect("/training/assessment/" + mod_data._id)} className="course-card">
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
            <div className="back-to-dashboard-section">
                <div className="back-button-container">
                    <Link href="/dashboard/Training/dashboard" className="back-button">Back to Dashboard</Link>
                </div>
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
        <div className="learning-time-section">
            <div className="learning-time-container">
                <div className="note-time">
                    <i className="pi pi-calendar-clock"></i>
                    <h3 className="note-time-text">Learning Time</h3>
                </div>
                <div className="time-box days-box">
                    <h3 className="time-value">{learningTime.days}</h3>
                    <p className="time-label">Days</p>
                </div>
                <div className="time-box hours-box">
                    <h3 className="time-value">{learningTime.hours}</h3>
                    <p className="time-label">Hours</p>
                </div>
                <div className="time-box minutes-box">
                    <h3 className="time-value">{learningTime.minutes}</h3>
                    <p className="time-label">Minutes</p>
                </div>
            </div>
        </div>
    );
};

export default LearningReportPage