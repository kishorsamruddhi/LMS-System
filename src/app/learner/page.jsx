"use client"
import React, { useEffect } from 'react'
// import "./styles.scss"
import { getCoursesAndModulesWithStats } from '../../api/get'
import { countsAndData } from '@/components/getStatsFunc'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useQuery } from '@tanstack/react-query'
import ErrorPage from '@/components/ErrorPage'
import LoadingSpinner from '@/components/Loading'
import Technology_Section from '@/components/Technology/TechnologySection'
import { cn } from '@/utils/cn'

const LearnerDashboard = () => {

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getCoursesAndModulesWithStats
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
      easing: 'ease-in-out',
      anchor: 'center',
      offset: 100,
    });
  }, []);

  if (isLoading || isFetching) { return <LoadingSpinner /> }

  if (error || data?.error|| !data?.data ) {
    return <ErrorPage message={data?.data || error} />
    
  }

  const courseList = data.data
  const counts = countsAndData(data)
  courses_tracking = counts
  const {
    getIdsOfAsmtAndPeda,
    idsOfCompletedModules,
    idsOfCompletedAsmt,
    idsOfCompletedPeda,
    coursesCompletedModulesCount,
    completedCourses,
    learningCourse,
    all_learning_courses_ids
  } = courses_tracking

  const ongoing = courseList && all_learning_courses_ids && courseList?.find((cor) => cor._id === all_learning_courses_ids[0])
  const upcoming = courseList && all_learning_courses_ids && courseList?.find((cor) => cor._id === all_learning_courses_ids[1])

  const cards = [
    {
      headTitle: "Completed",
      icon: "pi pi-check-circle",
      title: `${completedCourses[0]?.course_name || "0 Courses Completed"}`,
      modulePos: "1st",
      startLabel: "--tw-gradient-to",
      startValue: "#ffb94a",
      endLabel: "--tw-gradient-from",
      endValue: "#ffb94a",
    },
    {
      headTitle: "Ongoing",
      icon: "pi pi-list",
      title: ongoing?.course_name || "No ongoing course",
      modulePos: "2nd",
      startLabel: "--tw-gradient-to",
      startValue: "#ffd74a",
      endLabel: "--tw-gradient-from",
      endValue: "#ffd74a",
    },
    {
      headTitle: "Upcoming",
      icon: "pi pi-book",
      title: upcoming?.course_name || "No upcoming course",
      modulePos: "3rd",
      startLabel: "--tw-gradient-to",
      startValue: "#fff54a",
      endLabel: "--tw-gradient-from",
      endValue: "#fff54a",
    }
  ];

  const totalCompleted = [...idsOfCompletedAsmt, ...idsOfCompletedPeda].length;
  const totalIds = getIdsOfAsmtAndPeda.length;

  const percentage = totalIds > 0 ? ((totalCompleted * 100) / totalIds).toFixed(0) : 0;

  return (
    <div className="overflow-x-hidden [flex-grow:1]">
      <div className="px-8">
        <div className="">
          <div className="w-full grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] justify-between">
            <div data-aos="slide-right" className=" text-center sm:text-start mb-10 sm:mb-0  flex flex-col justify-center gap-2">
              <h4 className='text-xl font-semibold'>
                Your Overall Progress is
              </h4>
              <h2 className="text-3xl text-cyan-800">
                {percentage}%
              </h2>
              <p>
                Modules Completed:  <strong>{idsOfCompletedModules.length}</strong>
              </p>
              <p>
                Assessments Completed: <strong>{idsOfCompletedAsmt.length}</strong>
              </p>
            </div>
            {cards.map(({ headTitle, icon, title, startLabel, startValue, endLabel, endValue, moduelPos }, index) => {
              return <div
                style={{ [`${startLabel}`]: startValue, [`${endLabel}`]: endValue, color: "#000", minWidth: "150px" }} key={index}
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
                className={cn("p-5 flex flex-col justify-between bg-gradient-to-br from-[#366494] to-[#58C181]",
                  "sm:rounded-3xl rounded-xl min-h-[8rem] sm:min-h-[13rem] text-white"
                )}>
                <div >
                  <i className={icon}></i>
                  <p className="mt-2">
                    {headTitle}
                  </p>
                </div>
                <div className="">
                  <h3 className="text-xl">{title}</h3>
                </div>
                {/* <div className='bottom'>
                  <p className="text-base">Module</p>
                  <p className="text-xl">{moduelPos}</p>
                </div> */}
              </div>
            })}
          </div>
        </div>
        <div className="technology-section">
          {courseList && <Technology_Section courseList={courseList}
            courses_tracking={courses_tracking} />}
        </div>
      </div>
    </div>
  )
}

export default LearnerDashboard
