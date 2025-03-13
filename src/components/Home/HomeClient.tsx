"use client";

import { motion } from "framer-motion";
import CourseList from "@/components/Home/CourseList";

interface CourseProps {
    courses: {
        [sqlId: string]: string;
    };
}

export default function HomeClient({ courses }: CourseProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-4xl font-bold text-indigo-800 mb-8 text-center">
                    NDHU 課程列表
                </h1>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <CourseList courses={courses} />
                </div>
            </motion.div>
        </div>
    );
}
