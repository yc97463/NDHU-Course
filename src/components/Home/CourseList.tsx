// Client component for hover effects
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, X, Filter, Plus, Loader2, Minus } from "lucide-react";
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useRef, useState, useMemo, useEffect } from 'react';
import { ScheduleStorage } from "@/utils/scheduleStorage";
import { ScheduleCourse } from "@/types/schedule";

// 更新介面以匹配 API 資料結構
interface CourseInfo {
    id: string;
    name: string;
    college?: string; // 新增學院欄位
    offering_department?: string; // 新增開課系所欄位
    teacher?: string; // 新增教師欄位
    credits?: string; // 新增學分欄位
}

interface CourseListProps {
    courses: CourseInfo[];
    semester: string;
    viewMode: 'virtual' | 'grid'; // 新增 viewMode prop
}

export default function CourseList({ courses, semester, viewMode }: CourseListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const gridParentRef = useRef<HTMLDivElement>(null);

    // 篩選狀態
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    // 課表狀態管理
    const [coursesInSchedule, setCoursesInSchedule] = useState<Set<string>>(new Set());
    const [addingCourses, setAddingCourses] = useState<Set<string>>(new Set());

    // 檢查課程是否在課表中
    useEffect(() => {
        const checkCoursesInSchedule = () => {
            const inSchedule = new Set<string>();
            courses.forEach(course => {
                if (ScheduleStorage.isCourseInSchedule(semester, course.id)) {
                    inSchedule.add(course.id);
                }
            });
            setCoursesInSchedule(inSchedule);
        };

        checkCoursesInSchedule();
    }, [courses, semester]);

    // 快速加入課表處理函數
    const handleQuickAddToSchedule = async (course: CourseInfo, event: React.MouseEvent) => {
        event.preventDefault(); // 防止觸發 Link 導航
        event.stopPropagation();

        if (addingCourses.has(course.id)) return;

        setAddingCourses(prev => new Set(prev).add(course.id));

        try {
            // 從 API 獲取完整課程資料
            const response = await fetch(
                `https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${course.id}.json`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch course details');
            }

            const courseDetails = await response.json();

            // 轉換為 ScheduleCourse 格式
            const scheduleCourse: ScheduleCourse = {
                course_id: courseDetails.course_id,
                course_name: courseDetails.course_name,
                english_course_name: courseDetails.english_course_name || '',
                teacher: Array.isArray(courseDetails.teacher) ? courseDetails.teacher : [courseDetails.teacher],
                classroom: Array.isArray(courseDetails.classroom) ? courseDetails.classroom : [courseDetails.classroom],
                credits: courseDetails.credits || '',
                class_time: courseDetails.class_time.map((time: { day: string; period: string }) => ({
                    day: time.day?.toString() || '',
                    period: time.period?.toString() || ''
                })),
                semester: semester,
                departments: courseDetails.departments || []
            };

            const success = ScheduleStorage.addCourse(semester, scheduleCourse);

            if (success) {
                setCoursesInSchedule(prev => new Set(prev).add(course.id));
            } else {
                const hasConflict = ScheduleStorage.checkTimeConflict(semester, scheduleCourse);
                if (hasConflict) {
                    alert('無法加入課程：與現有課程時間衝突！');
                } else {
                    alert('課程已存在於課表中！');
                }
            }
        } catch (error) {
            console.error('Error adding course to schedule:', error);
            alert('加入課程時發生錯誤，請稍後再試。');
        } finally {
            setAddingCourses(prev => {
                const newSet = new Set(prev);
                newSet.delete(course.id);
                return newSet;
            });
        }
    };

    // 從課表移除課程
    const handleRemoveFromSchedule = (course: CourseInfo, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        ScheduleStorage.removeCourse(semester, course.id);
        setCoursesInSchedule(prev => {
            const newSet = new Set(prev);
            newSet.delete(course.id);
            return newSet;
        });
    };

    // 從課程資料中提取學院資訊並計算數量
    const collegeFilters = useMemo(() => {
        const collegeCount: { [key: string]: number } = {};

        // 計算每個學院的課程數量
        courses.forEach(course => {
            if (course.college) {
                // 提取學院名稱（去除英文部分）
                const collegeName = course.college.split('::')[0];
                collegeCount[collegeName] = (collegeCount[collegeName] || 0) + 1;
            }
        });

        // 學院顏色對應
        const collegeColors: { [key: string]: string } = {
            '理工學院': 'blue',
            '管理學院': 'purple',
            '人文社會科學學院': 'pink',
            '教育學院': 'yellow',
            '藝術學院': 'indigo',
            '原住民民族學院': 'red',
            '環境學院': 'emerald',
            '花師教育學院': 'green',
            '海洋科學學院': 'cyan',
        };

        // 建立篩選選項
        const filters = [
            { id: 'all', name: '全部', count: courses.length, color: 'gray' }
        ];

        // 按課程數量排序學院
        const sortedColleges = Object.entries(collegeCount)
            .sort(([, a], [, b]) => b - a)
            .map(([collegeName, count]) => ({
                id: collegeName,
                name: collegeName,
                count,
                color: collegeColors[collegeName] || 'gray'
            }));

        return [...filters, ...sortedColleges];
    }, [courses]);

    // 顏色對應
    const colorMap = {
        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
        blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
        green: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
        purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
        pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200',
        yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200',
        indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
        red: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
        emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
        cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200',
    };

    // 篩選課程
    const filteredCourses = useMemo(() => {
        if (selectedFilters.length === 0) {
            return courses;
        }

        return courses.filter(course => {
            if (!course.college) return false;
            const collegeName = course.college.split('::')[0];
            return selectedFilters.includes(collegeName);
        });
    }, [courses, selectedFilters]);

    // 處理篩選選擇
    const handleFilterToggle = (filterId: string) => {
        if (filterId === 'all') {
            setSelectedFilters([]);
            return;
        }

        setSelectedFilters(prev =>
            prev.includes(filterId)
                ? prev.filter(id => id !== filterId)
                : [...prev, filterId]
        );
    };

    // 清除所有篩選
    const clearAllFilters = () => {
        setSelectedFilters([]);
    };

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

    // 列表模式的虛擬化設定（使用篩選後的課程）
    const rowVirtualizer = useVirtualizer({
        count: filteredCourses.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120,
        overscan: 5,
    });

    // 網格模式的虛擬化設定（使用篩選後的課程）
    const gridRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < filteredCourses.length; i += columnsCount) {
            rows.push(filteredCourses.slice(i, i + columnsCount));
        }
        return rows;
    }, [filteredCourses, columnsCount]);

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
    const VirtualCourseCard = ({ course }: { course: CourseInfo }) => {
        const isInSchedule = coursesInSchedule.has(course.id);
        const isAdding = addingCourses.has(course.id);

        return (
            <div className="relative">
                <Link href={`/course/${semester}/${course.id}`}>
                    <motion.div
                        className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* 課程內容 */}
                        <div className="flex items-start justify-between h-full">
                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                        {course.id}
                                    </span>
                                    {course.college && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {course.college.split('::')[0]}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">
                                    {course.name.length > 30 ? course.name.substring(0, 30) + '...' : course.name}
                                </h3>
                                {course.teacher && (
                                    <p className="text-xs text-gray-500">
                                        教師：{course.teacher.replace(/\//g, '').trim()}
                                    </p>
                                )}
                                {course.credits && (
                                    <p className="text-xs text-gray-500">
                                        學分：{course.credits.split('/')[0]}
                                    </p>
                                )}
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

                {/* 快速加入課表按鈕 */}
                <motion.button
                    onClick={isInSchedule ? (e) => handleRemoveFromSchedule(course, e) : (e) => handleQuickAddToSchedule(course, e)}
                    disabled={isAdding}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 z-10 ${isInSchedule
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                        } ${isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    whileHover={!isAdding ? { scale: 1.1 } : {}}
                    whileTap={!isAdding ? { scale: 0.9 } : {}}
                    title={isInSchedule ? '從課表移除' : '加入課表'}
                >
                    {isAdding ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isInSchedule ? (
                        <Minus className="w-3 h-3" />
                    ) : (
                        <Plus className="w-3 h-3" />
                    )}
                </motion.button>
            </div>
        );
    };

    // 課程卡片組件 - 傳統版本（有動畫）
    const AnimatedCourseCard = ({ course, index }: { course: CourseInfo; index: number }) => {
        const isInSchedule = coursesInSchedule.has(course.id);
        const isAdding = addingCourses.has(course.id);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="h-full relative"
            >
                <Link href={`/course/${semester}/${course.id}`}>
                    <motion.div
                        className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* 課程內容 */}
                        <div className="flex items-start justify-between h-full">
                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                        {course.id}
                                    </span>
                                    {course.college && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {course.college.split('::')[0]}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">
                                    {course.name.length > 30 ? course.name.substring(0, 30) + '...' : course.name}
                                </h3>
                                {course.teacher && (
                                    <p className="text-xs text-gray-500">
                                        教師：{course.teacher.replace(/\//g, '').trim()}
                                    </p>
                                )}
                                {course.credits && (
                                    <p className="text-xs text-gray-500">
                                        學分：{course.credits.split('/')[0]}
                                    </p>
                                )}
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

                {/* 快速加入課表按鈕 */}
                <motion.button
                    onClick={isInSchedule ? (e) => handleRemoveFromSchedule(course, e) : (e) => handleQuickAddToSchedule(course, e)}
                    disabled={isAdding}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 z-10 ${isInSchedule
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
                        } ${isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    whileHover={!isAdding ? { scale: 1.1 } : {}}
                    whileTap={!isAdding ? { scale: 0.9 } : {}}
                    title={isInSchedule ? '從課表移除' : '加入課表'}
                >
                    {isAdding ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isInSchedule ? (
                        <Minus className="w-3 h-3" />
                    ) : (
                        <Plus className="w-3 h-3" />
                    )}
                </motion.button>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* 學院篩選 Pills */}
            {collegeFilters.length > 1 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">學院篩選</span>
                            {selectedFilters.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    （已選擇 {selectedFilters.length} 個）
                                </span>
                            )}
                        </div>
                        {selectedFilters.length > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                            >
                                清除全部
                            </button>
                        )}
                    </div>

                    {/* 篩選結果統計 */}
                    {selectedFilters.length > 0 && (
                        <div className="text-sm text-gray-600">
                            顯示 <span className="font-medium text-indigo-600">{filteredCourses.length}</span> 門課程
                            {filteredCourses.length !== courses.length && (
                                <span className="text-gray-500"> / 共 {courses.length} 門</span>
                            )}
                        </div>
                    )}

                    {/* Pills 容器 */}
                    <div className="flex flex-wrap gap-3">
                        {collegeFilters.map((filter) => {
                            const isSelected = filter.id === 'all'
                                ? selectedFilters.length === 0
                                : selectedFilters.includes(filter.id);

                            return (
                                <motion.button
                                    key={filter.id}
                                    onClick={() => handleFilterToggle(filter.id)}
                                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 ${isSelected
                                        ? `${colorMap[filter.color as keyof typeof colorMap]} ring-2 ring-offset-1 ring-current shadow-sm`
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    layout
                                >
                                    <span>{filter.name}</span>
                                    <span className={`inline-flex items-center justify-center px-2 text-xs rounded-lg ${isSelected
                                        ? 'bg-white/20 text-current'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {filter.count}
                                    </span>
                                    {isSelected && filter.id !== 'all' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <X className="w-3 h-3" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* 已選擇的篩選標籤 */}
                    {/* {selectedFilters.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center space-x-2 pt-2 border-t border-gray-100"
                        >
                            <span className="text-xs text-gray-500">已選擇：</span>
                            <div className="flex flex-wrap gap-1">
                                {selectedFilters.map((filterId) => {
                                    const filter = collegeFilters.find(f => f.id === filterId);
                                    if (!filter) return null;

                                    return (
                                        <motion.span
                                            key={filterId}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${colorMap[filter.color as keyof typeof colorMap]}`}
                                        >
                                            <span>{filter.name}</span>
                                            <button
                                                onClick={() => handleFilterToggle(filterId)}
                                                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </motion.span>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )} */}


                </div>
            )}

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
                            const course = filteredCourses[virtualItem.index];

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
                                    <div className="p-4">
                                        <VirtualCourseCard course={course} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 虛擬滾動網格模式 */}
            {viewMode === 'grid' && filteredCourses.length > 50 && (
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
                                    <div className="p-4">
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
            {viewMode === 'grid' && filteredCourses.length <= 50 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map((course, index) => (
                        <AnimatedCourseCard key={course.id} course={course} index={index} />
                    ))}
                </div>
            )}

            {/* 無篩選結果 */}
            {selectedFilters.length > 0 && filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">沒有符合條件的課程</h3>
                    <p className="text-gray-500 mb-4">請嘗試調整篩選條件或清除篩選</p>
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        清除所有篩選
                    </button>
                </div>
            )}
        </div>
    );
}
