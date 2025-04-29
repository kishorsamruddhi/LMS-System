import Link from "next/link";
import "./congrats.scss"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function LearnerCongrats({ module, totalQuestion, score }) {
    const calculate_score = ((score.length / totalQuestion.length) * 100).toFixed(0)
    return (
        <div>
            <div className="congrats-container">
                <div className="congrats-header">
                    {/* <h3 className="module-name">{module.course_name}</h3> */}
                    <div>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink className={"hover:text-cyan-500"} href={"/learner"}>My Courses</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {module.module_name}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="course-heading-wrap mt-4">
                        <h2 className="text-2xl">{module.module_desc}</h2>
                    </div>
                </div>

                <div className="score-wrap">
                    <div className="image-container">
                        <img className="result-image" src={calculate_score >= 70 ? '/assets/test_pass.gif' : '/assets/test_fail.gif'} alt='' />
                    </div>
                    <div className="column">
                        <div className="score-description">
                            {module.module_code === 'PR' ? (
                                <>
                                    <h3 className="completion-heading">Congratulations on completing the pre-assessment test!</h3>
                                    <p className="description">This is a great first step in your learning journey...</p>
                                    <p className="description">Remember, every step you take brings you closer to being Quantum Literate. Keep pushing forward, You’ve got this!</p>
                                </>
                            ) : (
                                <>
                                    {calculate_score >= 70 ? (
                                        <>
                                            <h3 className="completion-heading">Congratulations on passing the post-assessment test!</h3>
                                            <p className="description">Your hard work and dedication have truly paid off...</p>
                                            <p className="description">Remember, this is just the beginning of many more accomplishments to come. Well done!</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="description">Thank you for completing the post-assessment test...</p>
                                            <p className="description">Every attempt is an opportunity to learn and grow...</p>
                                            <p className="description">You’ve got this, and I believe in your success!</p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="score-section">
                            <h3 className="score-heading">Your score is</h3>
                            <h2 className="score-value">{calculate_score}/100</h2>
                        </div>
                        <div className="continue-learning">
                            <Link href={"/learner/my-courses"} className="continue-btn">Continue Learning</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
