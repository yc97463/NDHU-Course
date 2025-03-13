"use client";  // ✅ 告訴 Next.js 這是 Client Component

import { motion } from "framer-motion";

interface CourseProps {
    course: {
        course_name: string;
        course_id: string;
        credits: number;
        teacher: string[];
        classroom: string[];
        class_time: {
            day: string;
            period: number;
        }[];
        departments: {
            college: string;
            department: string;
        }[];
        syllabus_link: string;
        teaching_plan_link: string;
    };
}

// 動畫變體設定
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const slideIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function CourseDetailClient({ course }: CourseProps) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-blue-800 mb-2">{course.course_name}</h1>
                <p className="text-lg text-gray-600 mb-4">課程代碼: {course.course_id}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本資訊 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">基本資訊</h2>
                    <p><strong>學分數：</strong> {course.credits}</p>
                    <p><strong>教師：</strong> {course.teacher.join(", ")}</p>
                    <p><strong>教室：</strong> {course.classroom.join(", ")}</p>
                </motion.div>

                {/* 上課時間 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">上課時間</h2>
                    <ul>
                        {course.class_time.map((time, index) => (
                            <motion.li key={index} className="bg-gray-50 p-2 rounded-md">
                                {time.day} 第 {time.period} 節
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* 系所 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">系所</h2>
                    <ul>
                        {course.departments.map((dept, index) => (
                            <motion.li key={index} className="bg-gray-50 p-2 rounded-md">
                                {dept.college} - {dept.department}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* 課程大綱 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">相關資源</h2>
                    <motion.a
                        href={course.syllabus_link}
                        target="_blank"
                        className="block bg-blue-100 text-blue-700 px-4 py-2 rounded-md"
                        whileHover={{ scale: 1.03 }}
                    >
                        查看課程大綱 →
                    </motion.a>
                </motion.div>
            </div>
        </div>
    );
}
