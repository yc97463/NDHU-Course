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
        <>
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
        </>
    );
}
