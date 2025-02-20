// Dashboard.jsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import React from 'react';
const courses = [
    { id: 1, title: 'React for Beginners', progress: 70 },
    { id: 2, title: 'Advanced JavaScript', progress: 50 },
    { id: 3, title: 'CSS Mastery', progress: 30 },
];

const recentActivities = [
    { id: 1, activity: 'Completed React for Beginners' },
    { id: 2, activity: 'Started Advanced JavaScript' },
    { id: 3, activity: 'Reviewed CSS Mastery materials' },
];

const Dashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <h2 className="text-xl font-semibold mb-4">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {courses.map((course) => (
                    <Card key={course.id} className="p-4">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <div className="mt-2">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200">
                                            Progress
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold inline-block text-teal-600">
                                            {course.progress}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex h-2 mb-2 overflow-hidden text-xs bg-gray-200 rounded">
                                    <div
                                        style={{ width: `${course.progress}%` }}
                                        className="flex flex-col text-center text-white bg-teal-500 shadow-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <Button className="mt-4">View Course</Button>
                    </Card>
                ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <ul className="list-disc pl-5">
                {recentActivities.map((activity) => (
                    <li key={activity.id} className="mb-2">
                        {activity.activity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
