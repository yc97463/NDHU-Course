"use client";  // ✅ 告訴 Next.js 這是 Client Component

import { motion } from "framer-motion";
import {
    Award,
    Users,
    Building2,
    BookOpen,
    Hash,
    CalendarClock,
    Copy,
    Check,
    Plus,
    Minus,
    ArrowLeft,
    Clock,
    MapPin
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScheduleStorage } from "@/utils/scheduleStorage";
import { ScheduleCourse } from "@/types/schedule";

interface CourseProps {
    course: {
        english_course_name: string;
        sql_id: string;
        course_name: string;
        course_id: string;
        credits: string;
        teacher: string[];
        classroom: string[];
        class_time: {
            day: string;
            period: string | number;
        }[];
        departments: {
            college: string;
            department: string;
        }[];
        syllabus_link: string;
        teaching_plan_link: string;
    };
    semester: string;  // 新增 semester prop
    courseId: string;  // 新增 courseId prop
}

export default function CourseDetailClient({ course, semester, courseId }: CourseProps) {
    const [linkCopied, setLinkCopied] = useState(false);
    const [courseIdCopied, setCourseIdCopied] = useState(false);
    const [isInSchedule, setIsInSchedule] = useState(false);
    const [isAddingToSchedule, setIsAddingToSchedule] = useState(false);
    const router = useRouter();

    // 檢查課程是否已在課表中
    useEffect(() => {
        if (semester && course.course_id) {
            const inSchedule = ScheduleStorage.isCourseInSchedule(semester, course.course_id);
            setIsInSchedule(inSchedule);
        }
    }, [semester, course.course_id]);

    const copyLinkToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };

    const copyCourseIdToClipboard = () => {
        navigator.clipboard.writeText(course.course_id).then(() => {
            setCourseIdCopied(true);
            setTimeout(() => setCourseIdCopied(false), 2000);
        });
    };

    const handleAddToSchedule = () => {
        if (!semester || isAddingToSchedule) return;

        setIsAddingToSchedule(true);

        try {
            const scheduleCourse: ScheduleCourse = {
                course_id: course.course_id,
                course_name: course.course_name,
                english_course_name: course.english_course_name,
                teacher: course.teacher,
                classroom: course.classroom,
                credits: course.credits,
                class_time: course.class_time,
                semester: semester,
                departments: course.departments
            };

            const success = ScheduleStorage.addCourse(semester, scheduleCourse);

            if (success) {
                setIsInSchedule(true);
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
            setIsAddingToSchedule(false);
        }
    };

    const handleRemoveFromSchedule = () => {
        if (!semester) return;
        ScheduleStorage.removeCourse(semester, course.course_id);
        setIsInSchedule(false);
    };

    // 時間對應表
    const timeMap: Record<number, string> = {
        1: "06:10~07:00", 2: "07:10~08:00", 3: "08:10~09:00", 4: "09:10~10:00",
        5: "10:10~11:00", 6: "11:10~12:00", 7: "12:10~13:00", 8: "13:10~14:00",
        9: "14:10~15:00", 10: "15:10~16:00", 11: "16:10~17:00", 12: "17:10~18:00",
        13: "18:10~19:00", 14: "19:10~20:00", 15: "20:10~21:00", 16: "21:10~22:00"
    };

    const dayNames: Record<string, string> = {
        "一": "週一", "二": "週二", "三": "週三", "四": "週四",
        "五": "週五", "六": "週六", "日": "週日"
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 返回按鈕 */}
                <motion.button
                    onClick={() => router.back()}
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    whileHover={{ x: -2 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">返回</span>
                </motion.button>

                {/* 課程標題區域 */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                                <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                                    {course.course_id}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                {course.course_name}
                            </h1>
                            <p className="text-lg text-gray-600 mb-4">
                                {course.english_course_name}
                            </p>

                            {/* 基本資訊標籤 */}
                            <div className="flex flex-wrap gap-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                                    <Award className="w-4 h-4 mr-2" />
                                    {course.credits.split("/")[0]} 學分
                                </div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {course.credits.split("/")[1]} 時數
                                </div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                                    <Users className="w-4 h-4 mr-2" />
                                    {course.teacher.join("、")}
                                </div>
                            </div>
                        </div>

                        {/* 操作按鈕 */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                                onClick={isInSchedule ? handleRemoveFromSchedule : handleAddToSchedule}
                                disabled={isAddingToSchedule}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isInSchedule
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-500'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md'
                                    } ${isAddingToSchedule ? 'opacity-50 cursor-not-allowed' : ''}`}
                                whileHover={!isAddingToSchedule ? { scale: 1.02 } : {}}
                                whileTap={!isAddingToSchedule ? { scale: 0.98 } : {}}
                            >
                                {isAddingToSchedule ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                ) : isInSchedule ? (
                                    <Minus className="w-4 h-4 mr-2" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                {isAddingToSchedule
                                    ? "處理中..."
                                    : isInSchedule
                                        ? "從課表移除"
                                        : "加入課表"
                                }
                            </motion.button>

                            <motion.button
                                onClick={copyLinkToClipboard}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${linkCopied
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {linkCopied ? (
                                    <Check className="w-4 h-4 mr-2" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-2" />
                                )}
                                {linkCopied ? "已複製連結" : "複製課程連結"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* 主要內容區域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左側：課程資訊 */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 授課資訊 */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <Users className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-gray-900">授課資訊</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">授課教師</h3>
                                    <div className="space-y-2">
                                        {course.teacher.map((teacher, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                                <span className="text-gray-900">{teacher}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">上課教室</h3>
                                    <div className="space-y-2">
                                        {[...new Set(course.classroom)].map((room, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{room}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 上課時間 */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <CalendarClock className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-gray-900">上課時間表</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-indigo-50">
                                            {(() => {
                                                // Create a set of unique days where classes occur
                                                const usedDays = new Set<string>();
                                                course.class_time.forEach(time => {
                                                    usedDays.add(time.day);
                                                });

                                                // Define day order
                                                const dayOrder: Record<string, number> = {
                                                    "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7
                                                };

                                                // Convert to array and sort by day order
                                                const daysArray = Array.from(usedDays).sort(
                                                    (a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99)
                                                );

                                                // Create header cells - first the time period column
                                                const headers = [
                                                    <th key="period" className="border border-gray-200 px-3 py-2 text-sm font-semibold text-indigo-800 w-24">
                                                        時段
                                                    </th>
                                                ];

                                                // Then add a column for each day that has classes
                                                daysArray.forEach(day => {
                                                    headers.push(
                                                        <th key={day} className="border border-gray-200 px-3 py-2 text-sm font-semibold text-indigo-800">
                                                            {dayNames[day] || day}
                                                        </th>
                                                    );
                                                });

                                                return headers;
                                            })()}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            // Create a set of unique periods where classes occur
                                            const usedPeriods = new Set<number>();
                                            course.class_time.forEach(time => {
                                                usedPeriods.add(Number(time.period));
                                            });

                                            // Create a set of unique days where classes occur
                                            const usedDays = new Set<string>();
                                            course.class_time.forEach(time => {
                                                usedDays.add(time.day);
                                            });

                                            // Define day order
                                            const dayOrder: Record<string, number> = {
                                                "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7
                                            };

                                            // Convert to arrays and sort
                                            const periodsArray = Array.from(usedPeriods).sort((a, b) => a - b);
                                            const daysArray = Array.from(usedDays).sort(
                                                (a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99)
                                            );

                                            // If no periods or days, display a message
                                            if (periodsArray.length === 0 || daysArray.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={daysArray.length + 1} className="text-center py-4 text-gray-500">
                                                            沒有課程時間資訊
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            // 建立合併課程的資料結構
                                            const mergedPeriods: { [day: string]: { [period: number]: { rowSpan: number; isHidden: boolean; classroom: string } } } = {};

                                            daysArray.forEach(day => {
                                                mergedPeriods[day] = {};

                                                let i = 0;
                                                while (i < periodsArray.length) {
                                                    const currentPeriod = periodsArray[i];
                                                    const isClassTime = course.class_time.some(
                                                        time => time.day === day && Number(time.period) === currentPeriod
                                                    );

                                                    if (isClassTime) {
                                                        // 檢查連續的課程
                                                        let consecutiveCount = 1;
                                                        let j = i + 1;

                                                        while (j < periodsArray.length) {
                                                            const nextPeriod = periodsArray[j];
                                                            const nextIsClassTime = course.class_time.some(
                                                                time => time.day === day && Number(time.period) === nextPeriod
                                                            );

                                                            if (nextIsClassTime) {
                                                                consecutiveCount++;
                                                                j++;
                                                            } else {
                                                                break;
                                                            }
                                                        }

                                                        // 找到對應的教室
                                                        const classTimeIndex = course.class_time.findIndex(
                                                            time => time.day === day && Number(time.period) === currentPeriod
                                                        );
                                                        let classroom = "";
                                                        if (classTimeIndex >= 0 && classTimeIndex < course.classroom.length) {
                                                            classroom = course.classroom[classTimeIndex];
                                                        } else if (course.classroom.length > 0) {
                                                            classroom = course.classroom[0];
                                                        }

                                                        // 設定第一個格子的 rowSpan，其他格子標記為隱藏
                                                        mergedPeriods[day][currentPeriod] = {
                                                            rowSpan: consecutiveCount,
                                                            isHidden: false,
                                                            classroom
                                                        };

                                                        // 標記後續連續格子為隱藏
                                                        for (let k = 1; k < consecutiveCount; k++) {
                                                            const hiddenPeriod = periodsArray[i + k];
                                                            mergedPeriods[day][hiddenPeriod] = {
                                                                rowSpan: 1,
                                                                isHidden: true,
                                                                classroom: ""
                                                            };
                                                        }

                                                        i += consecutiveCount;
                                                    } else {
                                                        i++;
                                                    }
                                                }
                                            });

                                            return periodsArray.map(period => (
                                                <tr key={period} className="bg-gray-50/30">
                                                    <td className="border border-gray-200 px-2 py-1 bg-indigo-50/50 text-center">
                                                        <span className="font-medium text-sm">{period}</span>
                                                        <div className="text-xs text-gray-500 mt-1">{timeMap[period]}</div>
                                                    </td>
                                                    {daysArray.map(day => {
                                                        const mergedPeriod = mergedPeriods[day][period];

                                                        // 如果這個格子被標記為隱藏（因為被合併了），就不渲染
                                                        if (mergedPeriod?.isHidden) {
                                                            return null;
                                                        }

                                                        const isClassTime = course.class_time.some(
                                                            time => time.day === day && Number(time.period) === period
                                                        );

                                                        return (
                                                            <td
                                                                key={day}
                                                                className={`border border-gray-200 px-1 py-2 text-center align-middle relative`}
                                                                rowSpan={mergedPeriod?.rowSpan || 1}
                                                                style={{ height: mergedPeriod?.rowSpan ? `${mergedPeriod.rowSpan * 4}rem` : '4rem' }}
                                                            >
                                                                {isClassTime && (
                                                                    <motion.div
                                                                        className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer rounded-lg transition-colors"
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <div className="font-medium text-indigo-900 text-sm">
                                                                            {course.course_name.length > (mergedPeriod?.rowSpan && mergedPeriod.rowSpan > 1 ? 20 : 10)
                                                                                ? course.course_name.substring(0, mergedPeriod?.rowSpan && mergedPeriod.rowSpan > 1 ? 20 : 10) + '...'
                                                                                : course.course_name}
                                                                        </div>
                                                                        {mergedPeriod?.classroom && (
                                                                            <div className="text-xs text-indigo-700 mt-1">
                                                                                {mergedPeriod.classroom}
                                                                            </div>
                                                                        )}
                                                                        {mergedPeriod?.rowSpan && mergedPeriod.rowSpan > 1 && (
                                                                            <div className="text-xs text-indigo-600 mt-1 opacity-75">
                                                                                {mergedPeriod.rowSpan} 節連堂
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                                <span className="inline-block mr-4">* 僅顯示有課程的時段及星期</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* 右側：其他資訊 */}
                    <div className="space-y-8">
                        {/* 課程代碼 */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Hash className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">課程代碼</h2>
                            </div>
                            <motion.div
                                className={`rounded-lg p-4 cursor-pointer transition-colors ${courseIdCopied
                                    ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                onClick={copyCourseIdToClipboard}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="text-center">
                                    <div className={`text-xl font-mono font-bold mb-1 ${courseIdCopied
                                        ? 'text-emerald-900'
                                        : 'text-gray-900'
                                        }`}>
                                        {course.course_id}
                                    </div>
                                    <div className={`text-xs flex items-center justify-center gap-1 ${courseIdCopied
                                        ? 'text-emerald-700'
                                        : 'text-gray-500'
                                        }`}>
                                        {courseIdCopied ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                已複製
                                            </>
                                        ) : (
                                            "按一下複製"
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* 開課系所 */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">開課系所</h2>
                            </div>
                            <div className="space-y-3">
                                {course.departments.map((dept, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-sm font-medium text-indigo-700 mb-1">
                                            {dept.college.split("::")[0]}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {dept.department.split("::")[0]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 相關資源 */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold text-gray-900">相關資源</h2>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link href={`/course/${semester}/${courseId}/syllabus`}>
                                    <motion.div
                                        className="block bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 transition-colors cursor-pointer border border-indigo-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-indigo-900">課程大綱</div>
                                                <div className="text-sm text-indigo-700">查看詳細課程大綱</div>
                                            </div>
                                            <ArrowLeft className="w-4 h-4 text-indigo-600 rotate-180" />
                                        </div>
                                    </motion.div>
                                </Link>

                                <motion.a
                                    href={`https://elearn4.ndhu.edu.tw/gotomoodle.php?cid=${course.sql_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-emerald-50 hover:bg-emerald-100 rounded-lg p-4 transition-colors cursor-pointer border border-emerald-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-emerald-900">E 學苑課堂</div>
                                            <div className="text-sm text-emerald-700">連結至線上學習平台</div>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-emerald-600 rotate-180" />
                                    </div>
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
