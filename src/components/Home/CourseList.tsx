// Client component for hover effects
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Grid3X3, List } from "lucide-react";
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useRef, useState, useMemo, useEffect } from 'react';

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
    const parentRef = useRef<HTMLDivElement>(null);
    const gridParentRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'virtual' | 'grid'>('virtual');

    // 計算網格的列數（響應式）
    const getColumnsCount = () => {
        if (typeof window === 'undefined') return 3;
        const width = window.innerWidth;
        if (width < 768) return 1; // mobile
        if (width < 1024) return 2; // tablet
        return 3; // desktop
    };

    const [columnsCount, setColumnsCount] = useState(getColumnsCount);

    // 監聽視窗大小變化
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setColumnsCount(getColumnsCount());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 列表模式的虛擬化設定
    const rowVirtualizer = useVirtualizer({
        count: courses.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120,
        overscan: 5,
    });

    // 網格模式的虛擬化設定
    const gridRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < courses.length; i += columnsCount) {
            rows.push(courses.slice(i, i + columnsCount));
        }
        return rows;
    }, [courses, columnsCount]);

    const gridVirtualizer = useVirtualizer({
        count: gridRows.length,
        getScrollElement: () => gridParentRef.current,
        estimateSize: () => 140, // 網格行高度稍微高一點
        overscan: 3,
    });

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

    // 課程卡片組件 - 虛擬滾動版本（無動畫）
    const VirtualCourseCard = ({ course }: { course: CourseInfo }) => (
        <Link href={`/course/${semester}/${course.id}`}>
            <motion.div
                className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* 課程內容 */}
                <div className="flex items-start justify-between h-full">
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
    );

    // 課程卡片組件 - 傳統版本（有動畫）
    const AnimatedCourseCard = ({ course, index }: { course: CourseInfo; index: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="h-full"
        >
            <Link href={`/course/${semester}/${course.id}`}>
                <motion.div
                    className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* 課程內容 */}
                    <div className="flex items-start justify-between h-full">
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
    );

    return (
        <div className="space-y-4">
            {/* 視圖模式切換 */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {/* {courses.length > 50 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            虛擬滾動已啟用 ({viewMode === 'virtual' ? '列表' : '網格'}模式)
                        </span>
                    )} */}

                    {/* 在這裡增加學院選擇的 pill 篩選選項 */}
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">顯示模式：</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('virtual')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'virtual'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            <span>列表</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            <span>網格</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 虛擬滾動列表模式 */}
            {viewMode === 'virtual' && (
                <div
                    ref={parentRef}
                    className="h-96 overflow-auto border border-gray-200 rounded-xl bg-gray-50/50"
                    style={{
                        contain: 'strict',
                    }}
                >
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
                            const course = courses[virtualItem.index];

                            return (
                                <div
                                    key={virtualItem.key}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                >
                                    <div className="p-2 h-full">
                                        <VirtualCourseCard course={course} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 虛擬滾動網格模式 */}
            {viewMode === 'grid' && courses.length > 50 && (
                <div
                    ref={gridParentRef}
                    className="h-96 overflow-auto border border-gray-200 rounded-xl bg-gray-50/50"
                    style={{
                        contain: 'strict',
                    }}
                >
                    <div
                        style={{
                            height: `${gridVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {gridVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
                            const rowCourses = gridRows[virtualRow.index];

                            return (
                                <div
                                    key={virtualRow.key}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <div className="p-2 h-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                                            {rowCourses.map((course) => (
                                                <VirtualCourseCard
                                                    key={course.id}
                                                    course={course}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 傳統網格模式（少量課程時使用） */}
            {viewMode === 'grid' && courses.length <= 50 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, index) => (
                        <AnimatedCourseCard key={course.id} course={course} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
