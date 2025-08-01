"use client"
import React, { useEffect } from 'react'
import { getCoursesAndModulesWithStats } from '@/api/get';
import "./styles.scss"
import { countsAndData } from '@/components/getStatsFunc';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/Loading';
import { redirect } from 'next/navigation';
import { BadgeInfo, BookOpen, CircleCheckBig } from 'lucide-react';

const MyTechnology = () => {

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getCoursesAndModulesWithStats,
    })

    let courses_tracking = {
        getIdsOfAsmtAndPeda: [],
        idsOfCompletedModules: [],
        idsOfCompletedAsmt: [],
        idsOfCompletedPeda: [],
        coursesCompletedModulesCount: [],
        completedCourses: [],
        learningCourse: [],
        all_learning_courses_ids: []
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-in-out',
            anchor: 'center',
            offset: 70,
        });
    }, []);

    const redirectionToChild = ({ _id, module_type }) => {
        if (module_type === "ASSESSMENT") {
            redirect("/learner/assessment/" + _id)
        }
        else {
            redirect("/learner/pedagogy/" + _id)
        }
    }

    if (isLoading || isFetching) { return <LoadingSpinner /> }

    if (error || data?.error || !data.data) {
        return <ErrorPage message={data?.data || error} />
    }

    const courseList = data.data
    const counts = countsAndData(data)
    courses_tracking = counts
    const {
        idsOfCompletedAsmt,
        idsOfCompletedPeda,
        completedCourses,
    } = courses_tracking

    const totalCompletedChildIds = [...idsOfCompletedAsmt, ...idsOfCompletedPeda]

    function countMatchedValues(array1, array2) {
        const set2 = new Set(array2);
        const matchedValues = array1.filter(value => set2.has(value));
        return matchedValues.length;
    }

    if (isLoading) {
        return <div className='CoursesPage'>
            <h1>My Technology</h1>
            <div className="CourseList">
                <LoadingSpinner />
            </div>
        </div>
    }

    return (
        <div className='CoursesPage'>
            <h1 className='text-3xl '>My <span className='text-cyan-500'>Courses</span> </h1>
            <div className="CourseList">
                {courseList && courseList.map(({ _id, course_name, course_desc, color, modules }, cor_ind) => {
                    const isCourseCompleted = completedCourses.find((cor) => cor._id === _id)
                    return <div key={cor_ind} className="Course_Section">
                        <div data-aos="fade-up"
                            data-aos-delay={cor_ind * 100} className="info">
                            <h2 className='text-xl'>{course_name}</h2>
                            <p className='text-gray-600'>{course_desc}</p>
                        </div>
                        {modules.length === 0 ? <div style={{ justifyContent: " space-evenly" }} className='module'>
                            <div className="w-full">
                                <BadgeInfo className='mx-auto' />
                            </div>
                            <h3 style={{ textAlign: "center" }}>
                                Course doesn't have modules
                            </h3>

                        </div> : modules.map(({ _id: mod_id, module_name, module_type, assessments, pedagogies }, index) => {
                            const moduleChilds = module_type === "ASSESSMENT" ? assessments : pedagogies
                            if (moduleChilds.length == 0) return null
                            const module_complete_child_status = countMatchedValues(moduleChilds, totalCompletedChildIds)
                            const isModuleComplete = moduleChilds.length === module_complete_child_status
                            const isAssessment = module_type === "ASSESSMENT"
                            let str = isAssessment ? ["Retake Test", "Take Test"] : ["Learn Again", "Continue Learning", "Start Learning"]
                            return (
                                <div
                                    data-aos="fade-up"
                                    data-aos-delay={100 + cor_ind * 100 + index * 100}
                                    style={{ backgroundColor: color || "rgb(206, 17, 17)" }}
                                    key={index} onClick={() => redirectionToChild({ _id: mod_id, module_type, assessments, pedagogies })} className="module">
                                    <div className="top">
                                        {isModuleComplete ? <CircleCheckBig /> : <BookOpen />}
                                        <div className="title ">{index + 1}. {module_name}</div>
                                        <div className="description">
                                            <p>
                                                {module_type === "ASSESSMENT" ? `${moduleChilds.length} Assessments` : `${moduleChilds.length} Pedagogies`}
                                            </p>
                                            <p>  {module_complete_child_status === 0 ? "0" : (module_complete_child_status * 100 /
                                                moduleChilds.length).toFixed(0) || "0"}%
                                                Completed</p>
                                        </div>
                                    </div>
                                    <div className="bottom">
                                        {isAssessment ?
                                            <button>{isCourseCompleted || module_complete_child_status > 0 ? str[0] : str[1]}</button> :
                                            <button>{isCourseCompleted || isModuleComplete ? str[0] : module_complete_child_status > 0 ? str[1] : str[2]}</button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                })}
            </div>
        </div>
    )
}

export default MyTechnology