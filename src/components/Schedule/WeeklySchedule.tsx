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

    // 使用完整的時段和星期（週一到週五，第1-16節）
    const filteredTimeSlots = timeSlots; // 顯示所有時段
    const filteredDays = days; // 顯示週一到週五

    // 移除空課表的特殊處理，讓它顯示完整的空時刻表

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            {/* 表格標題 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">週課表</h3>
                    </div>
                    {courses.length > 0 && (
                        <div className="text-sm text-gray-600">
                            共 {courses.length} 門課程
                        </div>
                    )}
                </div>
            </div>

            {/* 時刻表 */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                                時段
                            </th>
                            {filteredDays.map(day => (
                                <th key={day.key} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[160px]">
                                    {day.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTimeSlots.map(slot => (
                            <tr key={slot.period} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-4 bg-gray-50/50 border-r border-gray-100">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-gray-900">{slot.period}</div>
                                        <div className="text-xs text-gray-500 mt-1">{slot.time}</div>
                                    </div>
                                </td>
                                {filteredDays.map(day => {
                                    const course = scheduleGrid[day.key][slot.period];

                                    return (
                                        <td key={day.key} className="px-2 py-2 align-top h-24 border-r border-gray-100 last:border-r-0">
                                            {course ? (
                                                <motion.div
                                                    className="h-full w-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3 relative group cursor-pointer hover:shadow-sm transition-all duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Link href={`/course/${semester}/${course.course_id}`}>
                                                        <div className="h-full flex flex-col justify-between">
                                                            <div>
                                                                <div className="font-medium text-indigo-900 text-xs leading-tight mb-2">
                                                                    {course.course_name.length > 14
                                                                        ? course.course_name.substring(0, 14) + '...'
                                                                        : course.course_name}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-xs text-indigo-700">
                                                                        <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                        <span className="truncate">
                                                                            {course.teacher.join(', ')}
                                                                        </span>
                                                                    </div>
                                                                    {course.classroom.length > 0 && (
                                                                        <div className="flex items-center text-xs text-indigo-700">
                                                                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                            <span className="truncate">
                                                                                {course.classroom[0]}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>

                                                    {/* 移除按鈕 */}
                                                    <motion.button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onRemoveCourse(course.course_id);
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </motion.button>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-200 hover:bg-gray-50 transition-colors rounded-lg group">
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
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4 text-gray-600">
                        <span>共 {courses.length} 門課程</span>
                        <span>
                            總學分：{courses.reduce((total, course) => {
                                const credits = parseFloat(course.credits.split('/')[0]) || 0;
                                return total + credits;
                            }, 0)} 學分
                        </span>
                    </div>
                    {courses.length > 0 && (
                        <div className="text-xs text-gray-500">
                            滑鼠移到課程上可進行操作
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 