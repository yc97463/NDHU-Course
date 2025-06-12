// Client component for hover effects
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

// Updated interface to represent course objects with ID and name
interface CourseInfo {
    id: string;
    name: string;
}

interface CourseListProps {
    courses: CourseInfo[];
    semester: string;
}

export default function CourseList({ courses, semester }: CourseListProps) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到課程</h3>
                <p className="text-gray-500">這個學期暫時沒有可用的課程資料</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
                <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <Link href={`/course/${semester}/${course.id}`}>
                        <motion.div
                            className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* 課程內容 */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                            {course.id}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                                        {course.name.length > 30 ? course.name.substring(0, 30) + '...' : course.name}
                                    </h3>
                                </div>
                                <motion.div
                                    className="flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                    whileHover={{ x: 2 }}
                                >
                                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                                </motion.div>
                            </div>

                            {/* 懸停效果 */}
                            <div className="absolute inset-0 bg-indigo-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        </motion.div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
