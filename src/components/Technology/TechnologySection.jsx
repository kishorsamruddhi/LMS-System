import "./tech.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css'
import "swiper/css";
import "swiper/css/free-mode";
import { coursesCardConfig, moduleCardsConfig } from './swiperConfig';
import { useState } from "react";
import { redirect } from "next/navigation";
const Technology_Section = ({ courseList, courses_tracking }) => {

    const [selectedCourse, setSelectedCourse] = useState(null);

    const redirectionToChild = ({
        _id, module_type, assessments, pedagogies
    }) => {
        const redirectTo = module_type === "ASSESSMENT" ? "assessment" : "pedagogy"
        const childsLength = module_type === "ASSESSMENT" ? assessments?.length : pedagogies?.length
        if (!childsLength) return
        return redirect(`/learner/${redirectTo}/${_id}`)
    }

    const {
        getIdsOfAsmtAndPeda, idsOfCompletedAsmt,
        idsOfCompletedModules, idsOfCompletedPeda,
        coursesCompletedModulesCount

    }
        = courses_tracking
    const totalCompletedChildIds = [...idsOfCompletedAsmt, ...idsOfCompletedPeda]

    function countMatchedValues(array1, array2) {
        const set2 = new Set(array2);
        const matchedValues = array1.filter(value => set2.has(value));
        return matchedValues.length;
    }
    return (
        <div className='Technology_Section'>
            <div className='dash-course-heading'>
                <h3 className='text-lg font-bold'>My <span className="text-cyan-500">Courses</span> </h3>
            </div>
            {selectedCourse && <div className="subChild">
                <div className="sub_nav_btns">
                    <div id="sub_prev">
                        <i className='pi pi-arrow-circle-left'></i>
                    </div>
                    <div id="sub_next">
                        <i className='pi pi-arrow-circle-right'></i>
                    </div>
                </div>
                <Swiper {...moduleCardsConfig}>
                    <SwiperSlide style={selectedCourse?.color ? { backgroundColor: selectedCourse.color } : {}}>
                        <div className="swiper-card">
                            <div className="top">
                                <i style={{ fontSize: "1.25rem" }} className="pi pi-sitemap"></i>
                                <div className="course_title">{selectedCourse.course_name}</div>
                            </div>
                            <div className="description">
                                <p>{selectedCourse.modules.length}  Modules</p>
                                <p>{coursesCompletedModulesCount[selectedCourse._id] || 0} Complete</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    {selectedCourse.modules.map(({ _id, module_name, module_type, assessments, pedagogies }, index) => {
                        const isCourseCompleted = false
                        const moduleChilds = module_type === "ASSESSMENT" ? assessments : pedagogies
                        if (moduleChilds.length == 0) return (<SwiperSlide
                            style={selectedCourse?.color ? { backgroundColor: selectedCourse.color } : {}}
                            className='swiper-slide' key={index}>
                            <div
                                style={selectedCourse?.color ? { backgroundColor: selectedCourse.color } : {}}
                                className="swiper-card module">
                                <div className="top">
                                    <div className="title">{module_name}</div>
                                    <div className="description">
                                        <p>
                                            {module_type === "ASSESSMENT" ? `${assessments.length} Assessments` : `${pedagogies.length} Pedagogies`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>)
                        const module_complete_child_status = countMatchedValues(moduleChilds, totalCompletedChildIds)
                        const isModuleComplete = moduleChilds.length === module_complete_child_status
                        const isAssessment = module_type === "ASSESSMENT"
                        let str = isAssessment ? ["Retake Test", "Take Test"] : ["Learn Again", "Continue Learning", "Start Learning"]

                        return (
                            <SwiperSlide
                                style={selectedCourse?.color ? { backgroundColor: selectedCourse.color } : {}}
                                className='swiper-slide' key={index}>
                                <div
                                    style={selectedCourse?.color ? { backgroundColor: selectedCourse.color } : {}}
                                    className="swiper-card module">
                                    <div className="top">
                                        {isModuleComplete ? <i style={{ fontSize: "1.25rem" }} className='pi pi-check-circle'></i> : <i style={{ fontSize: "1.25rem" }} className='pi pi-book'></i>}
                                        <div className="title">{module_name}</div>
                                        <div className="description">
                                            <p>
                                                {module_type === "ASSESSMENT" ? `${assessments.length} Assessments` : `${pedagogies.length} Pedagogies`}
                                            </p>
                                            <p>  {module_complete_child_status === 0 ? "0" : (module_complete_child_status * 100 /
                                                moduleChilds.length).toFixed(0) || "0"}%
                                                Completed</p>
                                        </div>
                                    </div>
                                    <div className="bottom">
                                        {isAssessment ?
                                            <button onClick={() => redirectionToChild({ _id, module_type, assessments, pedagogies })}>{isCourseCompleted || module_complete_child_status > 0 ? str[0] : str[1]}</button> :
                                            <button onClick={() => redirectionToChild({ _id, module_type, assessments, pedagogies })}>{isCourseCompleted || isModuleComplete ? str[0] : module_complete_child_status > 0 ? str[1] : str[2]}</button>}
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>}
            {courseList.length > 0 && <div className='course-slider-wrap'>
                <Swiper className="swiper"
                    {...coursesCardConfig}
                > {courseList?.map((course, index) => {
                    return (
                        <SwiperSlide style={course?.color ? { backgroundColor: course.color } : {}} className='swiper-slide' key={index}>
                            <div onClick={() => setSelectedCourse(course)}
                                className="swiper-card">
                                <div className="title">{course.course_name}</div>
                                <div className="description">
                                    <p>{course?.modules?.length}  Modules</p>
                                    <p>{coursesCompletedModulesCount[course._id] || 0} Completed</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    )
                })}
                </Swiper>
                <div id="prev">
                    <i className='pi pi-arrow-circle-left'></i>
                </div>
                <div id="next">
                    <i className='pi pi-arrow-circle-right'></i>
                </div>
            </div>}
        </div >
    );
}

export default Technology_Section;
