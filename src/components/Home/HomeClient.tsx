"use client";

import { motion } from "framer-motion";
import { Grid3X3, List } from "lucide-react";
import { useState } from "react";
import CourseList from "./CourseList";
import Link from "next/link";

interface CourseInfo {
    id: string;
    name: string;
    college?: string;
    offering_department?: string;
    teacher?: string;
    credits?: string;
}

interface SemesterData {
    semester: string;
    courses: CourseInfo[];
}

interface HomeClientProps {
    semesterData: SemesterData[];
}

export default function HomeClient({ semesterData }: HomeClientProps) {
    const [viewMode, setViewMode] = useState<'virtual' | 'grid'>('grid');

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
                                <Link href={`/search/${data.semester}`} className="text-sm text-indigo-600 rounded px-2.5 py-1.5 transition bg-indigo-100 hover:bg-indigo-200">
                                    進階搜尋
                                </Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                    {data.courses.length} 門課程
                                </span>

                                {/* 顯示模式切換 */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all min-w-[80px] ${viewMode === 'grid'
                                            ? 'bg-white text-indigo-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                        <span>網格</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('virtual')}
                                        className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all min-w-[80px] ${viewMode === 'virtual'
                                            ? 'bg-white text-indigo-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                        <span>列表</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 課程列表 */}
                    <div className="p-6">
                        <CourseList
                            courses={data.courses}
                            semester={data.semester}
                            viewMode={viewMode}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
