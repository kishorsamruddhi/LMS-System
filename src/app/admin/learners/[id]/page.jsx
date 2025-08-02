"use client";

import React, { use, useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import "./styles.scss"
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { calculateCourseProgress } from './const';
import { formatDate } from '@/utils/timeFormatter';
import LoadingSpinner from '@/components/Loading';
import { getAdmin_view_report_by_learner_id } from '@/api/_admin/getApis';
import AdminBackButton from '@/components/AdminBackButton';
import { useQuery } from '@tanstack/react-query';


Chart.register(ArcElement, Tooltip, Legend);

export default function Page({ params }) {
  const { id } = use(params);
  const { data: res, isLoading, error, isError } = useQuery({
    queryKey: ["learner-report", id],
    queryFn: async () => await getAdmin_view_report_by_learner_id(id),
    staleTime: 15000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!res || !res?.data) {
    return <div>No data available.</div>;
  }
  const data = res.data
  const { days,
    hours,
    minutes } = learningTime(data.learning_time?.timeSpent || 0)

  const x = calculateCourseProgress(data);

  const allModules = data?.courses.flatMap((cor) => cor.modules).length

  const totalCompleted = data?.completedModules?.length;

  const progressInPercentage = allModules > 0 ? ((totalCompleted * 100) / allModules).toFixed(0) : 0;

  const completed_courses = data?.completed_courses?.length
  const total_courses = data?.courses?.length
  const completed_modules = data?.completedModules?.length
  const completed_tests = data?.completedAssessments?.length
  const last_activity = formatDate(data.learning_time.updatedAt)

  return (
    <div className='viewReport'>
      <div>
        <AdminBackButton addOnPath='/learners' />
      </div>
      <div>
        <p className='text-gray-400'>Email: <span className='text-cyan-500'>{data.user?.email}</span></p>
        <p className='text-gray-400'>Phone Number: <span className='text-cyan-500'>{data.user?.phoneNumber}</span></p>
      </div>
      <div className="big-card">
        <div className="flex gap-10 justify-center my-10">
          <div className='text-neutral-200 font-semibold '>
            <h2 className='text-2xl'>Summary</h2>
            <h2 className='text-4xl text-white'>{progressInPercentage}%</h2>
            <h3>Progress Status</h3>
          </div>
          {/* Right */}
          <div className='text-neutral-200 font-semibold '>
            <p >
              Courses Status:  <span className='text-white text-lg'>{completed_courses}/{total_courses}</span>
            </p>
            <p >
              Modules Status:  <span className='text-white text-lg'>{completed_modules}/{allModules}</span>
            </p>
            <p>
              Completed Assessments: <span className='text-white text-lg'>{completed_tests}</span>
            </p>
            <p >{days} Days {hours} Hours {minutes} Minutes Spent</p>
            <small className='font-medium text-neutral-300'>Last Activity: {last_activity}</small>
          </div>
        </div>
      </div>
      <div style={{
        height: "400px", display: "flex", justifyContent: "center",
        backgroundColor: " #1d2029",
        padding: "2rem"
      }}>
        <DoughnutChart allDataResponse={data} courses={data.courses} progressData={x} />
      </div>
    </div >
  );
};

function DoughnutChart({ allDataResponse, courses, progressData }) {
  const objectKeys = Object.keys(progressData)
  const modsProgress = objectKeys.map((val) => progressData[val].completed_modules)
  const yetToBeCompleted = courses.flatMap((cor) => cor.modules).length - allDataResponse.completedModules.length

  const data = {
    labels: [...courses.flatMap((cor) => cor.course_name), "Incompleted Modules"],
    labels: courses.flatMap((cor) => cor.course_name),
    datasets: [
      {
        data: [...modsProgress, yetToBeCompleted],
        data: modsProgress,
        backgroundColor: [...courses.flatMap((cor) => cor.color), "#cacaca"],
        borderColor: [...courses.flatMap((cor) => cor.color), "#cacaca"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            if (!courses[index]) return [1 + " Modules left to complete",]
            const cor_id = courses[index]._id
            const getCorDetails = progressData[cor_id];
            const timeSpent = allDataResponse?.learning_time?.courses.find((cor) => cor.course_id === cor_id)
            const course_name = getCorDetails.course_name;
            let modules_completed = getCorDetails.completed_modules;
            let asmt_completed = getCorDetails.completed_assessments;
            let { days, hours, minutes } = learningTime(timeSpent?.timeSpent || 0);
            return [course_name, modules_completed + " Modules Completed", asmt_completed + " Assessment Completed", `${days || 0}d ${hours || 0}h ${minutes || 0}min Spent`];
          },
          title: function () {
            return 'Detailed Data';
          }
        },
        useHTML: true
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};
function learningTime(totalSeconds = 0) {
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    days: isNaN(days) ? 0 : days,
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
  };
};



