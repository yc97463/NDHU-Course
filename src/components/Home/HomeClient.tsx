"use client";

import { motion } from "framer-motion";
import CourseList from "@/components/Home/CourseList";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
            >
                <h1 className="text-4xl font-bold text-indigo-800 mb-8 text-center">
                    NDHU 課程列表
                </h1>

                {semesterData.map((data, index) => (
                    <motion.div
                        key={data.semester}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                            {data.semester} 學期
                        </h2>
                        <CourseList courses={data.courses} semester={data.semester} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
