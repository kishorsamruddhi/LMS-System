import React, { useState, useEffect } from 'react';
import '../../spinner.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../services/UserService';
import { getAssessmentData, getUserAssessmentsData, postAssessmentData, postLearning } from '../../services/LearningService';
import { getCurrentUTCTimestamp } from '../../services/Utils';
import Swal from 'sweetalert2'

export default function LearnerAssessment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [assessments, setAssessments] = useState([]);
    const [module, setModule] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    useEffect(() => {
        const userDetails = getUserDetails();
        if (userDetails.token === undefined) {
            navigate('/login');
        } else {
            getUserAssessments();
        }
    }, []);
    const getAssessments = async () => {
        const userDetails = getUserDetails();
        let module = sessionStorage.getItem('currentModule') !== undefined ? JSON.parse(sessionStorage.getItem('currentModule')) : {};
        let module_id = module.module_id;
        if (module_id !== undefined) {
            await addLearning(module);
            const assessmentData = await getAssessmentData(userDetails.token, module_id);
            if (assessmentData.error) {
                return [];
            } else {
                return assessmentData.data;

            }
        } else {
            return [];
        }
    };

    const getUserAssessments = async () => {
        const userDetails = getUserDetails();
        let module = sessionStorage.getItem('currentModule') !== undefined ? JSON.parse(sessionStorage.getItem('currentModule')) : {};
        setModule(module);
        let module_id = module.module_id;
        if (module_id !== undefined) {
            setLoading(true);
            const userAssessmentData = await getUserAssessmentsData(userDetails.token, module_id);
            let userAssessments = [];
            let userAssessmentMap = {};
            if (userAssessmentData.error === false) {
                userAssessments = userAssessmentData.data;
                for (let i = 0; i < userAssessments.length; i++) {
                    userAssessmentMap[userAssessments[i].assessment_id] = { user_option: userAssessments[i].user_option, user_assessment_id: userAssessments[i].id };
                }
            }
            let allAssessments = await getAssessments();
            if (allAssessments.length === 0) {
                setAssessments([]);
                toast.info("No Assessment Found!");
                navigate('/learner/courses');
            } else {
                for (let i = 0; i < allAssessments.length; i++) {
                    if (userAssessmentMap[allAssessments[i].id] !== undefined) {
                        allAssessments[i]["user_option"] = 0;
                        allAssessments[i]["user_assessment_id"] = userAssessmentMap[allAssessments[i].id].user_assessment_id;
                    } else {
                        allAssessments[i]["user_option"] = 0;
                        allAssessments[i]["user_assessment_id"] = -1;
                    }
                }
                setAssessments(allAssessments);
            }
            setLoading(false);
        } else {
            setAssessments([]);
            toast.info("No Assessment Found!");
            navigate('/learner/courses');
        }
    };

    const nextButtonClick = async () => {
        if (parseInt(assessments[currentQuestion].user_option) === 0) {
            await handleYesNoOptionChange(currentQuestion, "0", false);
            await loadNextQuestion();
        } else {
            setLoading1(true);
            await loadNextQuestion();
            setLoading1(false);
        }
    };

    const loadNextQuestion = async () => {
        if (currentQuestion + 1 !== assessments.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            let correct = 0;
            let total = 0;
            for (let i = 0; i < assessments.length; i++) {
                total = total + 1;
                if (parseInt(assessments[i].user_option) === assessments[i].correct_option_no) {
                    correct = correct + 1;
                }
            }
            let score = Math.round(correct * 100 / total, 2);
            sessionStorage.setItem('score', score);
            let module = sessionStorage.getItem('currentModule') !== undefined ? JSON.parse(sessionStorage.getItem('currentModule')) : {};
            let module_id = module.module_id;
            navigate('/learner/assessmentcomplete')
        }
    };

    const backButtonClick = async () => {
        if (currentQuestion - 1 >= 0) {
            if (parseInt(assessments[currentQuestion].user_option) === 0) {
                await handleYesNoOptionChange(currentQuestion, "0", false);
                setCurrentQuestion(currentQuestion - 1);
            } else {
                setLoading1(true);
                setCurrentQuestion(currentQuestion - 1);
                setLoading1(false);
            }
        } else {
            toast.info("This is first question!");
        }
    };

    const handleYesNoOptionChange = async (currentAssessment, option, showCorrectAnswer) => {

        let postObject = { assessment_id: assessments[currentAssessment].id, module_id: assessments[currentAssessment].module_id, user_option: option, correct_option: assessments[currentAssessment].correct_option_no };
        if (assessments[currentAssessment].user_assessment_id > -1) {
            postObject["id"] = assessments[currentAssessment].user_assessment_id;
        }
        await postAssessment(postObject, currentAssessment, option, showCorrectAnswer);
    };

    const handleMCQOptionChange = async (currentAssessment, option) => {

        let postObject = { assessment_id: assessments[currentAssessment].id, module_id: assessments[currentAssessment].module_id, user_option: option, correct_option: assessments[currentAssessment].correct_option_no };
        if (assessments[currentAssessment].user_assessment_id > -1) {
            postObject["id"] = assessments[currentAssessment].user_assessment_id;
        }
        await postAssessment(postObject, currentAssessment, option, true);
    };

    const postAssessment = async (postObject, currentAssessment, option, showCorrectAnswer) => {
        const userDetails = getUserDetails();
        setLoading1(true);
        postObject['cohort_id'] = userDetails.user.cohort_id;
        const response = await postAssessmentData(userDetails.token, postObject);
        if (response.error === false) {
            const newAssessments = [...assessments];
            newAssessments[currentAssessment]["user_option"] = option;
            newAssessments[currentAssessment]["user_assessment_id"] = response.data;
            setAssessments(newAssessments);
        } else {
            toast.error(response.data);
        }
        setLoading1(false);
        let icon = parseInt(postObject.user_option) === parseInt(postObject.correct_option) ? 'success' : 'error';
        icon = parseInt(postObject.user_option) === 0 ? 'info' : icon;
        let type = currentAssessment + 1 === assessments.length ? 'complete' : 'next';
        let correct_option = "option" + postObject.correct_option;
        let title = "Correct option is : " + assessments[currentAssessment][correct_option];
        if (showCorrectAnswer) {
            Swal.fire({
                title: title,
                showConfirmButton: true,
                confirmButtonText: "OK",
                icon: icon
            }
            ).then((result) => {
                if (result.isConfirmed) {
                    loadNextQuestion();
                }

            });
        }

    };

    const addLearning = async (module) => {
        const userDetails = getUserDetails();
        let currentTs = getCurrentUTCTimestamp();
        let objectToSend = { module_id: module.module_id, pedagogy_id: 1, learning_sec: 0, cohort_id: userDetails.user.cohort_id };
        const resp = await postLearning(userDetails.token, objectToSend);
        if (resp.error) {
        }

    };


    return (
        <div>
            {loading ? (
                <div className="spinner-container">
                    <img src='images/loading.gif' alt='GIF' />
                </div>
            ) : (
                <div className='pt-10'>
                    <div className='lg:px-12 px-6 pb-5 lg:pb-10 border-b-2 border-[#D0D0D0]'>
                        <h3 className='text-2xl text-secondary inter-700 mb-3 lg:hidden'>{module.course_name}</h3>
                        <div className='beardcrumb-wrap md:mb-5'>
                            <ul className='flex flex-wrap items-center'>
                                <li className='prev-page text-sm lg:text-lg inter-400 relative lg:mr-6 mr-4'>
                                    <a href='/learner/courses'>My Courses</a>
                                </li>
                                <li className='prev-page text-sm lg:text-lg inter-400 relative lg:mr-6 mr-4'>
                                    <a href='/learner/courses'>{module.course_name}</a>
                                </li>
                                <li className='current-page text-sm lg:text-lg inter-400 relative lg:mr-6 mr-4'>
                                    Module {module.module_seq_no}
                                </li>
                            </ul>
                        </div>
                        {/* <div className='course-heading-wrap'>
                        <h3 className='text-tertiary text-xl lg:text-2xl inter-500 mb-1'>Module 08</h3>
                        <h2 className='text-[#1D548D] text-3xl inter-500'>Assessment</h2>
                    </div> */}
                    </div>
                    <div className='assment-box-wrap flex flex-wrap lg:px-12 px-6'>
                        <div className='w-full lg:w-1/5 lg:py-20 py-5 lg:pr-20 border-r-2 border-white'>
                            <div className='text-center md:text-left'>
                                <p className='text-black md:text-center lg:text-left text-xl inter-700 mb-3 md:mb-0 lg:mb-7'>{module.module_name}</p>
                                {/* <p className='text-black text-xl inter-500'>{module.module_desc}</p> */}
                            </div>
                        </div>
                        <div className='lg:w-4/5 lg:py-20 lg:px-20 px-0 md:py-10 py-5'>
                            {assessments.length > 0 ? (
                                <>
                                    {!loading1 ? (
                                        <div>
                                            {assessments[currentQuestion].type === 'YES_NO' ? (
                                                <form>
                                                    <div className=''>
                                                        <div className='mb-12 lg:mb-20'>
                                                            {/* <p className='text-lg lg:text-2xl inter-400 text-black lg:mb-2 mb-1'>Q {currentQuestion+1}</p> */}
                                                            <p className='text-2xl lg:text-4xl inter-500 text-black text-center'>Q {currentQuestion + 1}. {assessments[currentQuestion].primary_text}</p>
                                                        </div>
                                                        <div className='flex items-center'>
                                                            <div className='w-1/2 lg:w-2/5 flex justify-center lg:justify-center'>
                                                                <label className='icon-radio-button cursor-pointer w-20 relative text-center text-black hover:text-tertiary'>
                                                                    <input className='absolute w-full h-full opacity-0 invisible cursor-pointer' type='radio' value='1' checked={assessments[currentQuestion].user_option === "1"} onChange={() => handleYesNoOptionChange(currentQuestion, "1", true)} />
                                                                    <div className='radio-icon-box pb-4 cursor-pointer'>
                                                                        <svg className='mx-auto w-20 h-20 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="125" height="125" viewBox="0 0 125 125" fill="none">
                                                                            <path className='transition duration-300' d="M62.5 2.12307e-05C50.1387 2.12307e-05 38.0549 3.66558 27.7769 10.5332C17.4988 17.4008 9.48803 27.1619 4.75756 38.5823C0.0270801 50.0027 -1.21063 62.5693 1.20095 74.6931C3.61252 86.817 9.56507 97.9534 18.3058 106.694C27.0466 115.435 38.1831 121.387 50.3069 123.799C62.4307 126.211 74.9973 124.973 86.4177 120.242C97.8381 115.512 107.599 107.501 114.467 97.2231C121.334 86.9451 125 74.8613 125 62.5C125.007 54.2905 123.395 46.1602 120.256 38.5743C117.118 30.9884 112.514 24.0958 106.709 18.2907C100.904 12.4857 94.0116 7.88228 86.4257 4.74376C78.8398 1.60524 70.7095 -0.00674791 62.5 2.12307e-05ZM62.5 110.294C53.0472 110.294 43.8067 107.491 35.947 102.239C28.0873 96.9877 21.9614 89.5232 18.344 80.79C14.7266 72.0568 13.7801 62.447 15.6243 53.1758C17.4684 43.9047 22.0203 35.3886 28.7045 28.7045C35.3886 22.0203 43.9047 17.4684 53.1758 15.6242C62.447 13.7801 72.0568 14.7266 80.79 18.344C89.5232 21.9614 96.9877 28.0873 102.239 35.947C107.491 43.8067 110.294 53.0472 110.294 62.5C110.307 68.7799 109.079 75.0006 106.682 80.8049C104.284 86.6092 100.764 91.883 96.3236 96.3236C91.883 100.764 86.6092 104.284 80.8049 106.682C75.0006 109.079 68.78 110.307 62.5 110.294ZM80.8824 43.0147L59.5588 68.75L44.853 58.0882C41.5441 55.5147 37.1324 56.25 34.5588 59.5588C31.9853 62.8676 32.7206 67.2794 36.0294 69.8529C40.4412 73.1618 45.2206 76.4706 49.6324 79.7794C52.9412 81.9853 55.8824 85.2941 59.9265 85.6618C61.0294 85.6618 62.5 85.6618 63.6029 84.9265L65.8088 82.7206L82.3529 62.8676C85.2941 59.1912 88.2353 55.8824 91.1765 52.2059C93.3823 49.2647 94.1176 45.5882 91.5441 42.6471L90.4412 41.5441C87.8676 39.7059 83.4559 40.0735 80.8824 43.0147Z" fill="#D9D9D9" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className='text-3xl inter-600 cursor-pointer transition duration-300'>{assessments[currentQuestion].option1}</p>
                                                                </label>
                                                            </div>
                                                            <div className='w-1/2 lg:w-2/5 flex justify-center lg:justify-center'>
                                                                <label className='icon-radio-button cursor-pointer w-20 relative text-center text-black hover:text-tertiary'>
                                                                    <input className='absolute w-full h-full opacity-0 invisible cursor-pointer' type='radio' value='2' checked={assessments[currentQuestion].user_option === "2"} onChange={() => handleYesNoOptionChange(currentQuestion, "2", true)} />
                                                                    <div className='radio-icon-box pb-4 cursor-pointer'>
                                                                        <svg className='mx-auto w-20 h-20 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="125" height="125" viewBox="0 0 125 125" fill="none">
                                                                            <path className='transition duration-300' d="M62.5 2.12307e-05C50.1387 2.12307e-05 38.0549 3.66558 27.7769 10.5332C17.4988 17.4008 9.48803 27.1619 4.75756 38.5823C0.0270801 50.0027 -1.21063 62.5693 1.20095 74.6931C3.61252 86.817 9.56507 97.9534 18.3058 106.694C27.0466 115.435 38.1831 121.387 50.3069 123.799C62.4307 126.211 74.9973 124.973 86.4177 120.242C97.8381 115.512 107.599 107.501 114.467 97.2231C121.334 86.9451 125 74.8613 125 62.5C125.007 54.2905 123.395 46.1602 120.256 38.5743C117.118 30.9884 112.514 24.0958 106.709 18.2907C100.904 12.4857 94.0116 7.88228 86.4257 4.74376C78.8398 1.60524 70.7095 -0.00674791 62.5 2.12307e-05ZM62.5 110.294C53.0472 110.294 43.8067 107.491 35.947 102.239C28.0873 96.9877 21.9614 89.5232 18.344 80.79C14.7266 72.0568 13.7801 62.447 15.6243 53.1758C17.4684 43.9047 22.0203 35.3886 28.7045 28.7045C35.3886 22.0203 43.9047 17.4684 53.1758 15.6242C62.447 13.7801 72.0568 14.7266 80.79 18.344C89.5232 21.9614 96.9877 28.0873 102.239 35.947C107.491 43.8067 110.294 53.0472 110.294 62.5C110.307 68.7799 109.079 75.0006 106.682 80.8049C104.284 86.6092 100.764 91.883 96.3236 96.3236C91.883 100.764 86.6092 104.284 80.8049 106.682C75.0006 109.079 68.78 110.307 62.5 110.294Z" fill="#D9D9D9" />
                                                                            <path className='transition duration-300' d="M83.4555 43.3825C82.7915 42.6858 81.9929 42.1311 81.1082 41.7521C80.2234 41.3731 79.271 41.1777 78.3085 41.1777C77.346 41.1777 76.3935 41.3731 75.5088 41.7521C74.624 42.1311 73.8254 42.6858 73.1614 43.3825L62.4996 54.0443L52.2055 43.7502C50.8358 42.4078 48.9916 41.6602 47.0737 41.6699C45.1558 41.6796 43.3193 42.4457 41.9631 43.8019C40.607 45.158 39.8408 46.9946 39.8311 48.9125C39.8215 50.8303 40.569 52.6745 41.9114 54.0443L52.2055 64.3384L41.9114 74.6325C40.569 76.0023 39.8215 77.8465 39.8311 79.7643C39.8408 81.6822 40.607 83.5187 41.9631 84.8749C43.3193 86.231 45.1558 86.9972 47.0737 87.0069C48.9916 87.0166 50.8358 86.269 52.2055 84.9266L62.4996 74.6325L72.7938 84.9266C74.1635 86.269 76.0077 87.0166 77.9256 87.0069C79.8434 86.9972 81.68 86.231 83.0361 84.8749C84.3923 83.5187 85.1584 81.6822 85.1681 79.7643C85.1778 77.8465 84.4302 76.0023 83.0879 74.6325L72.7938 64.3384L83.0879 54.0443C84.4665 52.6324 85.2683 50.7567 85.3364 48.7846C85.4044 46.8125 84.7336 44.886 83.4555 43.3825Z" fill="#D9D9D9" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className='text-3xl inter-600 cursor-pointer transition duration-300'>{assessments[currentQuestion].option2}</p>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                null
                                            )}
                                            {assessments[currentQuestion].type === 'MCQ' ? (
                                                <form>
                                                    <div className=''>
                                                        <div className='mb-12 lg:mb-20'>
                                                            {/* <p className='text-lg lg:text-2xl inter-400 text-black lg:mb-2 mb-1'>Q {currentQuestion+1}</p> */}
                                                            <p className='text-2xl lg:text-4xl inter-500 text-black'>Q {currentQuestion + 1}. {assessments[currentQuestion].primary_text}</p>
                                                        </div>
                                                        <div className=''>
                                                            {assessments[currentQuestion].option1 !== undefined && assessments[currentQuestion].option1 !== '' && assessments[currentQuestion].option1 !== null ? (
                                                                <div className=''>
                                                                    <div className='icon-radio-button flex items-start relative text-black hover:text-tertiary mb-5 md:mb-7'>
                                                                        <input className='absolute opacity-0 cursor-pointer w-8 h-8 md:w-10 md:h-10 z-20' id="option1" type='radio' value='1' checked={assessments[currentQuestion].user_option === "1"} onChange={() => handleMCQOptionChange(currentQuestion, "1")} />
                                                                        <div className='radio-icon-box cursor-pointer relative z-10'>
                                                                            <svg className='mx-auto w-8 h-8 md:w-10 md:h-10 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                                                <g clipPath="url(#clip0_210_4621)">
                                                                                    <g filter="url(#filter0_d_210_4621)">
                                                                                        <path className='transition duration-300' fillRule="evenodd" clipRule="evenodd" d="M45.8327 24.9998C45.8327 36.5057 36.5052 45.8332 24.9993 45.8332C13.4934 45.8332 4.16602 36.5057 4.16602 24.9998C4.16602 13.4939 13.4934 4.1665 24.9993 4.1665C36.5052 4.1665 45.8327 13.4939 45.8327 24.9998ZM41.666 24.9998C41.666 34.2046 34.2041 41.6665 24.9993 41.6665C15.7946 41.6665 8.33268 34.2046 8.33268 24.9998C8.33268 15.7951 15.7946 8.33317 24.9993 8.33317C34.2041 8.33317 41.666 15.7951 41.666 24.9998Z" fill="black" />
                                                                                    </g>
                                                                                </g>
                                                                            </svg>
                                                                            <span className='radio-dot inline-block transition duration-300 w-3 h-3 md:w-4 md:h-4 rounded-full bg-tertiary absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 scale-0'></span>
                                                                        </div>
                                                                        <label htmlFor="option1" className='cursor-pointer'>
                                                                            <p className='text-lg md:text-2xl inter-500 text-black pl-8 md:pl-10 lg:pl-16'>{assessments[currentQuestion].option1}</p>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                null
                                                            )}
                                                            {assessments[currentQuestion].option2 !== undefined && assessments[currentQuestion].option2 !== '' && assessments[currentQuestion].option2 !== null ? (
                                                                <div className=''>
                                                                    <div className='icon-radio-button flex items-start relative text-black hover:text-tertiary mb-5 md:mb-7'>
                                                                        <input className='absolute opacity-0 cursor-pointer w-8 h-8 md:w-10 md:h-10 z-20' id="option2" type='radio' value='2' checked={assessments[currentQuestion].user_option === "2"} onChange={() => handleMCQOptionChange(currentQuestion, "2")} />
                                                                        <div className='radio-icon-box cursor-pointer relative z-10'>
                                                                            <svg className='mx-auto w-8 h-8 md:w-10 md:h-10 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                                                <g clipPath="url(#clip0_210_4621)">
                                                                                    <g filter="url(#filter0_d_210_4621)">
                                                                                        <path className='transition duration-300' fillRule="evenodd" clipRule="evenodd" d="M45.8327 24.9998C45.8327 36.5057 36.5052 45.8332 24.9993 45.8332C13.4934 45.8332 4.16602 36.5057 4.16602 24.9998C4.16602 13.4939 13.4934 4.1665 24.9993 4.1665C36.5052 4.1665 45.8327 13.4939 45.8327 24.9998ZM41.666 24.9998C41.666 34.2046 34.2041 41.6665 24.9993 41.6665C15.7946 41.6665 8.33268 34.2046 8.33268 24.9998C8.33268 15.7951 15.7946 8.33317 24.9993 8.33317C34.2041 8.33317 41.666 15.7951 41.666 24.9998Z" fill="black" />
                                                                                    </g>
                                                                                </g>
                                                                            </svg>
                                                                            <span className='radio-dot inline-block transition duration-300 w-3 h-3 md:w-4 md:h-4 rounded-full bg-tertiary absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 scale-0'></span>
                                                                        </div>
                                                                        <label htmlFor="option2" className='cursor-pointer'>
                                                                            <p className='text-lg md:text-2xl inter-500 text-black pl-8 md:pl-10 lg:pl-16'>{assessments[currentQuestion].option2}</p>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                null
                                                            )}
                                                            {assessments[currentQuestion].option3 !== undefined && assessments[currentQuestion].option3 !== '' && assessments[currentQuestion].option3 !== null ? (
                                                                <div className=''>
                                                                    <div className='icon-radio-button flex items-start relative text-black hover:text-tertiary mb-5 md:mb-7'>
                                                                        <input className='absolute opacity-0 cursor-pointer w-8 h-8 md:w-10 md:h-10 z-20' id="option3" type='radio' value='3' checked={assessments[currentQuestion].user_option === "3"} onChange={() => handleMCQOptionChange(currentQuestion, "3")} />
                                                                        <div className='radio-icon-box cursor-pointer relative z-10'>
                                                                            <svg className='mx-auto w-8 h-8 md:w-10 md:h-10 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                                                <g clipPath="url(#clip0_210_4621)">
                                                                                    <g filter="url(#filter0_d_210_4621)">
                                                                                        <path className='transition duration-300' fillRule="evenodd" clipRule="evenodd" d="M45.8327 24.9998C45.8327 36.5057 36.5052 45.8332 24.9993 45.8332C13.4934 45.8332 4.16602 36.5057 4.16602 24.9998C4.16602 13.4939 13.4934 4.1665 24.9993 4.1665C36.5052 4.1665 45.8327 13.4939 45.8327 24.9998ZM41.666 24.9998C41.666 34.2046 34.2041 41.6665 24.9993 41.6665C15.7946 41.6665 8.33268 34.2046 8.33268 24.9998C8.33268 15.7951 15.7946 8.33317 24.9993 8.33317C34.2041 8.33317 41.666 15.7951 41.666 24.9998Z" fill="black" />
                                                                                    </g>
                                                                                </g>
                                                                            </svg>
                                                                            <span className='radio-dot inline-block transition duration-300 w-3 h-3 md:w-4 md:h-4 rounded-full bg-tertiary absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 scale-0'></span>
                                                                        </div>
                                                                        <label htmlFor="option3" className='cursor-pointer'>
                                                                            <p className='text-lg md:text-2xl inter-500 text-black pl-8 md:pl-10 lg:pl-16'>{assessments[currentQuestion].option3}</p>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                null
                                                            )}
                                                            {assessments[currentQuestion].option4 !== undefined && assessments[currentQuestion].option4 !== '' && assessments[currentQuestion].option4 !== null ? (
                                                                <div className=''>
                                                                    <div className='icon-radio-button flex items-start relative text-black hover:text-tertiary mb-5 md:mb-7'>
                                                                        <input className='absolute opacity-0 cursor-pointer w-8 h-8 md:w-10 md:h-10 z-20' type='radio' value='4' checked={assessments[currentQuestion].user_option === "4"} onChange={() => handleMCQOptionChange(currentQuestion, "4")} />
                                                                        <div className='radio-icon-box cursor-pointer relative z-10'>
                                                                            <svg className='mx-auto w-8 h-8 md:w-10 md:h-10 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                                                <g clipPath="url(#clip0_210_4621)">
                                                                                    <g filter="url(#filter0_d_210_4621)">
                                                                                        <path className='transition duration-300' fillRule="evenodd" clipRule="evenodd" d="M45.8327 24.9998C45.8327 36.5057 36.5052 45.8332 24.9993 45.8332C13.4934 45.8332 4.16602 36.5057 4.16602 24.9998C4.16602 13.4939 13.4934 4.1665 24.9993 4.1665C36.5052 4.1665 45.8327 13.4939 45.8327 24.9998ZM41.666 24.9998C41.666 34.2046 34.2041 41.6665 24.9993 41.6665C15.7946 41.6665 8.33268 34.2046 8.33268 24.9998C8.33268 15.7951 15.7946 8.33317 24.9993 8.33317C34.2041 8.33317 41.666 15.7951 41.666 24.9998Z" fill="black" />
                                                                                    </g>
                                                                                </g>
                                                                            </svg>
                                                                            <span className='radio-dot inline-block transition duration-300 w-3 h-3 md:w-4 md:h-4 rounded-full bg-tertiary absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 scale-0'></span>
                                                                        </div>
                                                                        <label>
                                                                            <p className='text-lg md:text-2xl inter-500 text-black pl-8 md:pl-10 lg:pl-16'>{assessments[currentQuestion].option4}</p>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                null
                                                            )}
                                                            {assessments[currentQuestion].option5 !== undefined && assessments[currentQuestion].option5 !== '' && assessments[currentQuestion].option5 !== null ? (
                                                                <div className=''>
                                                                    <div className='icon-radio-button flex items-start relative text-black hover:text-tertiary mb-5 md:mb-7'>
                                                                        <input className='absolute opacity-0 cursor-pointer w-8 h-8 md:w-10 md:h-10 z-20' type='radio' value='5' checked={assessments[currentQuestion].user_option === "5"} onChange={() => handleMCQOptionChange(currentQuestion, "5")} />
                                                                        <div className='radio-icon-box cursor-pointer relative z-10'>
                                                                            <svg className='mx-auto w-8 h-8 md:w-10 md:h-10 transition duration-300' xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                                                <g clipPath="url(#clip0_210_4621)">
                                                                                    <g filter="url(#filter0_d_210_4621)">
                                                                                        <path className='transition duration-300' fillRule="evenodd" clipRule="evenodd" d="M45.8327 24.9998C45.8327 36.5057 36.5052 45.8332 24.9993 45.8332C13.4934 45.8332 4.16602 36.5057 4.16602 24.9998C4.16602 13.4939 13.4934 4.1665 24.9993 4.1665C36.5052 4.1665 45.8327 13.4939 45.8327 24.9998ZM41.666 24.9998C41.666 34.2046 34.2041 41.6665 24.9993 41.6665C15.7946 41.6665 8.33268 34.2046 8.33268 24.9998C8.33268 15.7951 15.7946 8.33317 24.9993 8.33317C34.2041 8.33317 41.666 15.7951 41.666 24.9998Z" fill="black" />
                                                                                    </g>
                                                                                </g>
                                                                            </svg>
                                                                            <span className='radio-dot inline-block transition duration-300 w-3 h-3 md:w-4 md:h-4 rounded-full bg-tertiary absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 scale-0'></span>
                                                                        </div>
                                                                        <label>
                                                                            <p className='text-lg md:text-2xl inter-500 text-black pl-8 md:pl-10 lg:pl-16'>{assessments[currentQuestion].option5}</p>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                null
                                                            )}

                                                        </div>
                                                    </div>
                                                </form>

                                            ) : (
                                                null
                                            )}
                                            <div className='lg:py-10 py-8 lg:px-12 px-6 course-navigate-btns flex flex-wrap justify-between'>
                                                <a onClick={() => backButtonClick()} className='cursor-pointer mb-4 md:mb-0 w-full md:w-auto bg-secondary hover:bg-black flex items-center justify-center px-6 h-10 2xl:h-16 text-white inter-700 text-base 2xl:text-2xl rounded-3xl lg:rounded-full transition duration-300 button-shadow'>Back</a>
                                                {currentQuestion === assessments.length - 1 ? (
                                                    <a onClick={() => nextButtonClick()} className='cursor-pointer mb-4 md:mb-0 w-full md:w-auto bg-secondary hover:bg-black flex items-center justify-center px-6 h-10 2xl:h-16 text-white inter-700 text-base 2xl:text-2xl rounded-3xl lg:rounded-full transition duration-300 button-shadow'>Complete Assessment</a>
                                                ) : (
                                                    <a onClick={() => nextButtonClick()} className='cursor-pointer mb-4 md:mb-0 w-full md:w-auto bg-secondary hover:bg-black flex items-center justify-center px-6 h-10 2xl:h-16 text-white inter-700 text-base 2xl:text-2xl rounded-3xl lg:rounded-full transition duration-300 button-shadow'>Skip</a>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="spinner-container1">
                                            <img src='images/loading.gif' alt='GIF' />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <h4>No Assessment Found!</h4>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}