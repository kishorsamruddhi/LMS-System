
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import "./styles.scss"
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useParams } from 'react-router-dom';
import { getAdmin_view_report_by_learner_id } from '@/api/Super_Admin/qlite/getApis';
import LoadingSpinner from '@/Loading';
import { calculateCourseProgress } from './const';
import { formatDate } from '@/utils/timeFormatter';
import SuperAdminBackButton from '@/components/ui/SuperAdminBackButton';



Chart.register(ArcElement, Tooltip, Legend);

const _View_Learner_Report = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const getData = async () => {
    try {
      const resp = await getAdmin_view_report_by_learner_id(id);
      if (!resp.data.error) {
        setData(resp.data);
      } else {
        console.error(resp.data.error);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

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
        <SuperAdminBackButton hardURL={"/super-admin/dashboard/training-dashboard/learners"} />
      </div>
      <div>
        <h1>{data.user?.firstName} {data.user?.lastName}</h1>
        <p style={{ fontSize: "12px", marginTop: "6px", color: "#cacaca" }}>Email: {data.user?.email}</p>
        <p style={{ fontSize: "12px", marginTop: "6px", color: "#cacaca" }}>Phone Number:{data.user?.phoneNumber}</p>
      </div>
      <div className="big-card">
        <h2>Summary</h2>
        <div className="counts-details">
          <section>
            <h1>{progressInPercentage}%</h1>
            <h3>Progress Status</h3>
          </section>
          <section className='counts'>
            <div className='data-counts'>
              <div className="complete_count">
                <span className='focus'>{completed_courses}</span> Courses Completed
              </div>
              <div className="total_count">
                <i className="pi pi-circle-fill"></i>
                Out of <span className='focus'>{total_courses}</span>
              </div>
            </div>
            <div className='data-counts'>
              <div className="complete_count">
                <span className='focus'>{completed_modules}</span> Modules Completed
              </div>
              <div className="total_count">
                <i className="pi pi-circle-fill"></i>
                Out of <span className='focus'>{allModules}</span>
              </div>
            </div>
            <div className='data-counts'>
              <div className="complete_count">
                <span className='focus'>{completed_tests}</span> Assessments Completed
              </div>
            </div>
            <div className='data-counts'>
              <div className="complete_count">
                <span className='focus'>{days} Days {hours} Hours {minutes} Minutes Spent</span>
              </div>
            </div>
            <span className='time'>Last Activity: {last_activity}</span>
          </section>
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

const DoughnutChart = ({ allDataResponse, courses, progressData }) => {
  const objectKeys = Object.keys(progressData)
  const modsProgress = objectKeys.map((val) => progressData[val].completed_modules)
  // const yetToBeCompleted = courses.flatMap((cor) => cor.modules).length - allDataResponse.completedModules.length

  const data = {
    // labels: [...courses.flatMap((cor) => cor.course_name), "Incompleted Modules"],
    labels: courses.flatMap((cor) => cor.course_name),
    datasets: [
      {
        // data: [...modsProgress, yetToBeCompleted],
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
    days,
    hours,
    minutes,
  };
};



export default _View_Learner_Report

