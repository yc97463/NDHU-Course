"use client";

import { motion } from "framer-motion";
import CourseList from "./CourseList";

interface CourseInfo {
    id: string;
    name: string;
}

interface SemesterData {
    semester: string;
    courses: CourseInfo[];
}

interface HomeClientProps {
    semesterData: SemesterData[];
}

export default function HomeClient({ semesterData }: HomeClientProps) {
    return (
        <div className="space-y-8">
            {semesterData.map((data, index) => (
                <motion.div
                    key={data.semester}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                    {/* 學期標題 */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {data.semester} 學期
                                </h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                    {data.courses.length} 門課程
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 課程列表 */}
                    <div className="p-6">
                        <CourseList courses={data.courses} semester={data.semester} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
