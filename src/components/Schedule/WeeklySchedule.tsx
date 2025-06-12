"use client";

import { motion } from "framer-motion";
import { ScheduleCourse } from "@/types/schedule";
import { Trash2, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";

interface WeeklyScheduleProps {
    courses: ScheduleCourse[];
    semester: string;
    onRemoveCourse: (courseId: string) => void;
}

const timeSlots = [
    { period: 1, time: "06:10~07:00" },
    { period: 2, time: "07:10~08:00" },
    { period: 3, time: "08:10~09:00" },
    { period: 4, time: "09:10~10:00" },
    { period: 5, time: "10:10~11:00" },
    { period: 6, time: "11:10~12:00" },
    { period: 7, time: "12:10~13:00" },
    { period: 8, time: "13:10~14:00" },
    { period: 9, time: "14:10~15:00" },
    { period: 10, time: "15:10~16:00" },
    { period: 11, time: "16:10~17:00" },
    { period: 12, time: "17:10~18:00" },
    { period: 13, time: "18:10~19:00" },
    { period: 14, time: "19:10~20:00" },
    { period: 15, time: "20:10~21:00" },
    { period: 16, time: "21:10~22:00" },
];

const days = [
    { key: "一", name: "週一" },
    { key: "二", name: "週二" },
    { key: "三", name: "週三" },
    { key: "四", name: "週四" },
    { key: "五", name: "週五" },
];

export default function WeeklySchedule({ courses, semester, onRemoveCourse }: WeeklyScheduleProps) {
    // 建立時間表格資料結構
    const scheduleGrid: { [day: string]: { [period: number]: ScheduleCourse | null } } = {};

    // 初始化格子 - 使用所有星期和時段
    days.forEach(day => {
        scheduleGrid[day.key] = {};
        timeSlots.forEach(slot => {
            scheduleGrid[day.key][slot.period] = null;
        });
    });

    // 填入課程資料
    courses.forEach(course => {
        course.class_time.forEach(classTime => {
            const period = Number(classTime.period);
            if (scheduleGrid[classTime.day] && timeSlots.some(slot => slot.period === period)) {
                scheduleGrid[classTime.day][period] = course;
            }
        });
    });

    // 建立合併課程的資料結構
    const mergedCourses: { [day: string]: { [period: number]: { course: ScheduleCourse; rowSpan: number; isHidden: boolean } } } = {};

    days.forEach(day => {
        mergedCourses[day.key] = {};

        let i = 0;
        while (i < timeSlots.length) {
            const currentPeriod = timeSlots[i].period;
            const course = scheduleGrid[day.key][currentPeriod];

            if (course) {
                // 檢查連續的課程
                let consecutiveCount = 1;
                let j = i + 1;

                while (j < timeSlots.length) {
                    const nextPeriod = timeSlots[j].period;
                    const nextCourse = scheduleGrid[day.key][nextPeriod];

                    if (nextCourse && nextCourse.course_id === course.course_id) {
                        consecutiveCount++;
                        j++;
                    } else {
                        break;
                    }
                }

                // 設定第一個格子的 rowSpan，其他格子標記為隱藏
                mergedCourses[day.key][currentPeriod] = {
                    course,
                    rowSpan: consecutiveCount,
                    isHidden: false
                };

                // 標記後續連續格子為隱藏
                for (let k = 1; k < consecutiveCount; k++) {
                    const hiddenPeriod = timeSlots[i + k].period;
                    mergedCourses[day.key][hiddenPeriod] = {
                        course,
                        rowSpan: 1,
                        isHidden: true
                    };
                }

                i += consecutiveCount;
            } else {
                i++;
            }
        }
    });

    // 使用完整的時段和星期（週一到週五，第1-16節）
    const filteredTimeSlots = timeSlots; // 顯示所有時段
    const filteredDays = days; // 顯示週一到週五

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            {/* 表格標題 */}
            <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">週課表</h3>
                    </div>
                    {courses.length > 0 && (
                        <div className="text-sm text-indigo-700 font-medium">
                            共 {courses.length} 門課程
                        </div>
                    )}
                </div>
            </div>

            {/* 時刻表 */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-indigo-50">
                            <th className="border border-gray-200 px-3 py-2 text-sm font-semibold text-indigo-800 w-24">
                                時段
                            </th>
                            {filteredDays.map(day => (
                                <th key={day.key} className="border border-gray-200 px-3 py-2 text-sm font-semibold text-indigo-800 min-w-[160px]">
                                    {day.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTimeSlots.map(slot => (
                            <tr key={slot.period} className="bg-gray-50/30">
                                <td className="border border-gray-200 px-2 py-1 bg-indigo-50/50 text-center">
                                    <span className="font-medium text-sm">{slot.period}</span>
                                    <div className="text-xs text-gray-500 mt-1">{slot.time}</div>
                                </td>
                                {filteredDays.map(day => {
                                    const mergedCourse = mergedCourses[day.key][slot.period];

                                    // 如果這個格子被標記為隱藏（因為被合併了），就不渲染
                                    if (mergedCourse?.isHidden) {
                                        return null;
                                    }

                                    return (
                                        <td
                                            key={day.key}
                                            className="border border-gray-200 px-1 py-2 text-center align-middle relative"
                                            rowSpan={mergedCourse?.rowSpan || 1}
                                            style={{ height: mergedCourse?.rowSpan ? `${mergedCourse.rowSpan * 4}rem` : '4rem' }}
                                        >
                                            {mergedCourse?.course ? (
                                                <motion.div
                                                    className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer rounded-lg group transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Link href={`/course/${semester}/${mergedCourse.course.course_id}`} className="w-full h-full flex flex-col items-center justify-center">
                                                        <div className="font-medium text-indigo-900 text-sm text-center leading-tight">
                                                            {mergedCourse.course.course_name.length > (mergedCourse.rowSpan > 1 ? 20 : 10)
                                                                ? mergedCourse.course.course_name.substring(0, mergedCourse.rowSpan > 1 ? 20 : 10) + '...'
                                                                : mergedCourse.course.course_name}
                                                        </div>
                                                        {mergedCourse.course.classroom.length > 0 && (
                                                            <div className="text-xs text-indigo-700 mt-1">
                                                                {mergedCourse.course.classroom[0]}
                                                            </div>
                                                        )}
                                                        {mergedCourse.rowSpan > 1 && (
                                                            <div className="text-xs text-indigo-600 mt-1 opacity-75">
                                                                {mergedCourse.rowSpan} 節連堂
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* 移除按鈕 */}
                                                    <motion.button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onRemoveCourse(mergedCourse.course.course_id);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm z-10"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </motion.button>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors rounded-sm group">
                                                    <div className="text-xs opacity-0 group-hover:opacity-50 transition-opacity">
                                                        空堂
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 課程統計 */}
            <div className="bg-indigo-50/50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4 text-gray-700">
                        <span className="font-medium">共 {courses.length} 門課程</span>
                        <span>
                            總學分：{courses.reduce((total, course) => {
                                const credits = parseFloat(course.credits.split('/')[0]) || 0;
                                return total + credits;
                            }, 0)} 學分
                        </span>
                    </div>
                    {courses.length > 0 && (
                        <div className="text-xs text-gray-500">
                            * 僅顯示週一至週五，第1-16節
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 