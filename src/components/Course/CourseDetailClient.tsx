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
    Check
} from "lucide-react";
import { useState } from "react";

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
            period: string | number; // Updated to handle both string and number types
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

// 課程格子動畫效果
const courseBoxVariants = {
    hover: {
        scale: 1.05,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

export default function CourseDetailClient({ course }: CourseProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">{course.course_name}</h1>
                    <p className="text-lg text-gray-600">{course.english_course_name}</p>
                </motion.div>
                <motion.div
                    className="flex items-center space-x-2"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <motion.button
                        onClick={() => copyToClipboard(window.location.href)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors cursor-pointer ${copied ? 'bg-green-100 hover:green-200 text-green-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                            {copied ? "已複製連結" : "複製課程連結"}
                        </span>
                    </motion.button>
                </motion.div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本資訊 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        基本資訊
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center p-2 bg-blue-50/50 rounded-md hover:bg-blue-50 transition-colors">
                            <div className="mr-3 bg-blue-100 p-2 rounded-full text-blue-600 flex items-center justify-center">
                                <Award className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500">學分與時數</div>
                                <div className="font-medium flex items-center space-x-2">
                                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                                        <span className="text-xs mr-1">學分</span>
                                        <span className="font-semibold">{course.credits.split("/")[0]}</span>
                                    </span>
                                    <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                                        <span className="text-xs mr-1">時數</span>
                                        <span className="font-semibold">{course.credits.split("/")[1]}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center p-2 bg-blue-50/50 rounded-md hover:bg-blue-50 transition-colors">
                            <div className="mr-3 bg-blue-100 p-2 rounded-full text-blue-600 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500">授課教師</div>
                                <div className="font-medium">
                                    {course.teacher.map((teacher, idx) => (
                                        <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                                            {teacher}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center p-2 bg-blue-50/50 rounded-md hover:bg-blue-50 transition-colors">
                            <div className="mr-3 bg-blue-100 p-2 rounded-full text-blue-600 flex items-center justify-center">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500">上課教室</div>
                                <div className="font-medium">
                                    {[...new Set(course.classroom)].map((room, idx) => (
                                        <span key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                                            {room}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="flex items-center p-2 bg-blue-50/50 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => copyToClipboard(course.course_id)}
                        >
                            <div className="mr-3 bg-blue-100 p-2 rounded-full text-blue-600 flex items-center justify-center">
                                <Hash className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 flex items-center">
                                    課程代碼
                                    <motion.div
                                        className="ml-1 text-xs flex items-center"
                                        animate={copied ? { opacity: 1 } : { opacity: 0 }}
                                    >
                                        <span className="text-green-600 flex items-center">
                                            <Check className="h-3 w-3 mr-1" /> 已複製
                                        </span>
                                    </motion.div>
                                </div>
                                <div className="font-medium flex items-center justify-between">
                                    <span>{course.course_id}</span>
                                    <motion.div
                                        className={`text-blue-500 ${copied ? 'text-green-500' : ''}`}
                                        animate={copied ?
                                            { rotate: [0, 45, 0], scale: [1, 1.2, 1] } :
                                            { opacity: 0.7 }
                                        }
                                        transition={{ duration: 0.3 }}
                                    >
                                        {copied ?
                                            <Check className="h-4 w-4" /> :
                                            <Copy className="h-4 w-4" />
                                        }
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 上課時間 */}
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <CalendarClock className="w-5 h-5 mr-2 text-blue-600" />
                        上課時間表
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-50">
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

                                        // Map days to their display names
                                        const dayDisplayNames: Record<string, string> = {
                                            "一": "週一", "二": "週二", "三": "週三", "四": "週四",
                                            "五": "週五", "六": "週六", "日": "週日"
                                        };

                                        // Create header cells - first the time period column
                                        const headers = [
                                            <th key="period" className="border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-800 w-24">
                                                時段
                                            </th>
                                        ];

                                        // Then add a column for each day that has classes
                                        daysArray.forEach(day => {
                                            headers.push(
                                                <th key={day} className="border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-800">
                                                    {dayDisplayNames[day] || day}
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

                                    // Generate rows only for periods with classes
                                    const timeMap: Record<number, string> = {
                                        1: "06:10~07:00", 2: "07:10~08:00", 3: "08:10~09:00", 4: "09:10~10:00",
                                        5: "10:10~11:00", 6: "11:10~12:00", 7: "12:10~13:00", 8: "13:10~14:00",
                                        9: "14:10~15:00", 10: "15:10~16:00", 11: "16:10~17:00", 12: "17:10~18:00",
                                        13: "18:10~19:00", 14: "19:10~20:00", 15: "20:10~21:00", 16: "21:10~22:00"
                                    };

                                    return periodsArray.map(period => (
                                        <tr key={period} className="bg-blue-50/30">
                                            <td className="border border-gray-200 px-2 py-1 bg-blue-50/50 text-center">
                                                <span className="font-medium text-sm">{period}</span>
                                                <div className="text-xs text-gray-500 mt-1">{timeMap[period]}</div>
                                            </td>
                                            {daysArray.map(day => {
                                                const classTimeEntry = course.class_time.find(
                                                    time => time.day === day && String(time.period) === String(period)
                                                );
                                                const isClassTime = !!classTimeEntry;

                                                // Find classroom for this specific day and period
                                                let classroom = "";
                                                if (isClassTime) {
                                                    const index = course.class_time.findIndex(
                                                        time => time.day === day && String(time.period) === String(period)
                                                    );
                                                    if (index >= 0 && index < course.classroom.length) {
                                                        classroom = course.classroom[index];
                                                    } else if (course.classroom.length > 0) {
                                                        classroom = course.classroom[0];
                                                    }
                                                }

                                                return (
                                                    <td
                                                        key={day}
                                                        className={`border border-gray-200 px-1 py-2 text-center align-middle h-16 relative ${!isClassTime ? '' : ''
                                                            }`}
                                                    >
                                                        {isClassTime && (
                                                            <motion.div
                                                                className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 p-1 bg-gradient-to-br from-blue-100 to-blue-200 cursor-pointer"
                                                                whileHover="hover"
                                                                variants={courseBoxVariants}
                                                                initial={{ borderRadius: "0.25rem" }}
                                                            >
                                                                <div className="font-medium text-blue-800 text-sm">
                                                                    {course.course_name.length > 10
                                                                        ? course.course_name.substring(0, 10) + '...'
                                                                        : course.course_name}
                                                                </div>
                                                                {classroom && (
                                                                    <div className="text-xs text-blue-600 mt-1">
                                                                        {classroom}
                                                                    </div>
                                                                )}
                                                                <motion.div
                                                                    className="absolute inset-0 bg-blue-400/10 opacity-0 rounded"
                                                                    whileHover={{ opacity: 1 }}
                                                                    transition={{ duration: 0.2 }}
                                                                />
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
                        {/* <span className="float-right">移動滑鼠至課堂可放大檢視</span> */}
                    </div>
                </motion.div >

                {/* 系所 */}
                < motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">開課及上課系所</h2>
                    <ul className="space-y-2">
                        {course.departments.map((dept, index) => (
                            <motion.li key={index} className="bg-gray-50 p-2 rounded-md">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md mr-2">
                                    {dept.college.split("::")[0]}
                                </span>
                                {dept.department.split("::")[0]}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div >

                {/* 課程大綱 */}
                < motion.div
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    initial="hidden"
                    animate="visible"
                    variants={slideIn}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">相關資源</h2>
                    <div className="space-y-2">
                        <motion.a
                            href={course.teaching_plan_link}
                            target="_blank"
                            className="block bg-blue-100 text-blue-700 px-4 py-2 rounded-md"
                            whileHover={{ scale: 1.03 }}
                        >
                            查看教學計劃表 →
                        </motion.a>
                        <motion.a
                            href={`https://elearn4.ndhu.edu.tw/gotomoodle.php?cid=${course.sql_id}`}
                            target="_blank"
                            className="block bg-blue-100 text-blue-700 px-4 py-2 rounded-md"
                            whileHover={{ scale: 1.03 }}
                        >
                            連結至 E 學苑課堂 →
                        </motion.a>
                    </div>
                </motion.div >
            </div >
        </div >
    );
}
