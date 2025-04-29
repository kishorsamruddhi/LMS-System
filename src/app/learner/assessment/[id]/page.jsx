"use client"
import "./styles.scss"
import React, { use, useState } from 'react'
import { get_assessments_with_status, submitAssessmentAnswer } from '@/api/get'
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-toastify"
import LearnerCongrats from "./_Complete"
import LoadingSpinner from "@/components/Loading"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Loader, Shredder } from "lucide-react"

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
    const currentQuestionIndex = childArray.findIndex(val => val._id === activeAssessment._id)
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
                <div className="">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className={"hover:text-cyan-500"} href={"/learner"}>My Courses</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className={"hover:text-cyan-500"} href={"/learner"}>{module_data.module_name}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                Question No. {currentQuestionIndex + 1}
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <p> <span className="text-cyan-500 font-bold"> {currentQuestionIndex + 1}</span> out of {childArray.length} </p>
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
            {childArray.length > 1 && <div className="actionButtons">
                {!isFirstQuestion ? <Button icon="pi pi-angle-left" className="pre" style={{ padding: "8px 16px" }}
                    onClick={handlePre}>Back</Button> : <div></div>}
                {!isLastQuestion ? <Button iconPos="right" icon="pi pi-angle-right" className="next" style={{ padding: "8px 16px" }} onClick={handleNext}>Next</Button> : <div></div>}
            </div>}
        </div>
    )
}

const Question = ({ module_id, setSuccessScore, setIsTestComplete, data, isLastQuestion, setActiveQuestion, course_id }) => {
    const { primary_text, secondary_text, options, _id } = data
    const [choosedOption, setChoosedOption] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit() {
        if (!choosedOption) return
        if (isLoading) return
        setIsLoading(true)
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
        finally {
            setIsLoading(false)
        }
    }

    function choosingOption(val) {
        setChoosedOption(val)
    }

    return <div className='Question_Section'>
        {primary_text && <h1>Q. {primary_text}</h1>}
        {secondary_text && <h3>{secondary_text}</h3>}
        <div className="options px-2">
            {options?.map((opt, i) => <label htmlFor={opt} onClick={() => choosingOption(opt)} key={i} className="option hover:bg-gray-200">
                <Checkbox checked={choosedOption === opt} name={"option"} id={opt} />
                <span>{opt}</span></label>)}
            <label htmlFor={"SKIP"} onClick={() => choosingOption("0.SKIP")} className="option  hover:bg-gray-200">
                <Checkbox id={"SKIP"} checked={choosedOption === "0.SKIP"} onChange={() => choosingOption("0.SKIP")} name={"option"} />
                <span>SKIP THIS </span></label>
        </div>
        <div className="px-2 mt-2">
            <Button
                disabled={isLoading}
                onClick={handleSubmit} style={{ padding: "8px 16px", fontWeight: "600", gap: ".35rem" }} className="Submit border hover:border-cyan-500  hover:text-cyan-500 " >Submit
                {isLoading ? <Loader /> : <Shredder />}
            </Button>
        </div>
    </div>
}

export default Assessment
