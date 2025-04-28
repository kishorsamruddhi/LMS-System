"use client"
import "./styles.scss"
import React, { use, useState } from 'react'
import { get_assessments_with_status, submitAssessmentAnswer } from '@/api/get'
import { useQuery } from "@tanstack/react-query"

import { toast } from "react-toastify"
import LearnerCongrats from "./Complete"
import LoadingSpinner from "@/components/Loading"
import Link from "next/link"
function Button({ children, ...props }) {
    return <button {...props}>
        {children}
    </button>
}
function Checkbox({ ...props }) {
    return <input type="checkbox" {...props} />
}

const Assessment = ({ params }) => {
    const { id } = use(params)
    const [activeQuestion, setActiveQuestion] = useState(0)
    const [isTestComplete, setIsTestComplete] = useState(false)
    const [successScore, setSuccessScore] = useState([])
    const {
        data,
        isError, isLoading, error
    } = useQuery({
        queryKey: ["module_id", id],
        queryFn: () => getAssessments(id)
    })

    async function getAssessments(id) {
        try {
            const res = await get_assessments_with_status(id)
            if (!res?.error) {
                return res.data
            }
            return new Error(res.data);
        } catch (error) {
            return new Error(error.message);
        }
    }
    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isError) {
        return <h1>{error}</h1>
    }

    const module_data = data.module_id
    const childArray = module_data.assessments
    const completedArrayList = data.completed_Assessments
    const activeAssessment = childArray[activeQuestion]
    const isFirstQuestion = activeQuestion === 0
    const isLastQuestion = activeQuestion === childArray?.length - 1
    const handlePre = () => {
        if (isFirstQuestion) return
        setActiveQuestion(pre => pre - 1)
    }
    const handleNext = async () => {
        if (isLastQuestion) return
        setActiveQuestion(pre => pre + 1)
    }
    if (isTestComplete) {
        return <LearnerCongrats totalQuestion={childArray} score={successScore} module={module_data}
        />
    }
    return (
        <div className='Assessment'>
            <div className="Assessment_nav">
                <div className="breadCrumbs">
                    {/* <h3>Assessment</h3><i className="pi pi-angle-right"></i> */}
                    <Link href={"/dashboard/Training/dashboard"}>My Courses</Link> <i className="pi pi-angle-right"></i>
                    <Link href={"/dashboard/Training/dashboard"}>{module_data.module_name}</Link>
                </div>
                {/* <BackButton href="/dashboard/Training/dashboard" /> */}
            </div>
            {/* {assessments.map((data, index) => { */}
            <Question
                module_id={module_data._id}
                course_id={data.course_id}
                isLastQuestion={isLastQuestion}
                data={activeAssessment}
                setActiveQuestion={setActiveQuestion}
                setSuccessScore={setSuccessScore}
                setIsTestComplete={setIsTestComplete}
            />
            {/* })} */}
            <div className="actionButtons">
                {!isFirstQuestion ? <Button icon="pi pi-angle-left" className="pre" style={{ padding: "8px 16px" }}
                    onClick={handlePre}>Back</Button> : <div></div>}
                {!isLastQuestion ? <Button iconPos="right" icon="pi pi-angle-right" className="next" style={{ padding: "8px 16px" }} onClick={handleNext}>Next</Button> : <div></div>}
            </div>
        </div>
    )
}

const Question = ({ module_id, setSuccessScore, setIsTestComplete, data, isLastQuestion, setActiveQuestion, course_id }) => {
    const { primary_text, secondary_text, options, _id } = data
    const [choosedOption, setChoosedOption] = useState(null)

    async function handleSubmit() {
        if (!choosedOption) return
        try {
            const resp = await submitAssessmentAnswer({
                module_id, course_id,
                assessment_id: _id, user_option: choosedOption
            })

            if (resp?.error) {
                return toast.error("Error while submitting answer")
            }
            else {
                if (resp.data) {
                    toast.success("You choose correct option")
                    setSuccessScore(pre => {
                        const x = [...pre]
                        return [...x, {
                            module_id, course_id,
                            assessment_id: _id,
                        }]
                    })
                } else {
                    toast.error("You choose wrong option")
                }
                return setTimeout(() => {
                    if (!isLastQuestion) {
                        setActiveQuestion(pre => pre + 1)
                    }
                    else {
                        setIsTestComplete(true)
                    }
                }, 600)
            }
        } catch (error) {
            return toast.error("Error while submitting answer")
        }
    }


    return <div className='Question_Section'>
        {primary_text && <h1>Q. {primary_text}</h1>}
        {secondary_text && <h3>{secondary_text}</h3>}
        <div className="options px-2">
            {options?.map((opt, i) => <div key={i} className="option">
                <Checkbox checked={choosedOption === opt} onChange={() => setChoosedOption(opt)} name={"option"} id={opt} />
                <p onClick={() => setChoosedOption(opt)}>{opt}</p></div>)}
            <div className="option">
                <Checkbox checked={choosedOption === "0.SKIP"} onChange={() => setChoosedOption("0.SKIP")} name={"option"} />
                <p onClick={() => setChoosedOption("0.SKIP")}>SKIP THIS </p></div>
        </div>
        <div className="px-2 mt-2">
            <Button icon="pi pi-upload" onClick={handleSubmit} style={{ padding: "8px 16px", fontWeight: "600", gap: ".35rem" }} className="Submit " >Submit</Button>
        </div>
    </div>
}

export default Assessment



const BackButton = ({ ...props }) => {
    return (
        <Link className="back" {...props}>
            <i className="pi pi-arrow-left"></i>{" "}
        </Link>
    );
};