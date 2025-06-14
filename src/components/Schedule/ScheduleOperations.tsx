"use client";

import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";
import { ScheduleStorage } from "@/utils/scheduleStorage";

interface ScheduleOperationsProps {
    name: string;
    semester: string;
    courses: string[];
}

export default function ScheduleOperations({ name, semester, courses }: ScheduleOperationsProps) {
    const handleAddToMySchedule = () => {
        if (!semester || courses.length === 0) return;

        // 檢查是否已有該學期的課程
        const existingCourses = ScheduleStorage.getSemesterCourses(semester);
        if (existingCourses.length > 0) {
            if (!confirm(`您已經有 ${semester} 學期的課程，加入這些課程可能會造成時間衝突。是否繼續？`)) {
                return;
            }
        }

        // 從 API 獲取課程詳細資訊並添加到課表
        Promise.all(
            courses.map(courseId =>
                fetch(`https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${courseId}.json`)
                    .then(res => res.json())
            )
        ).then(courseData => {
            let addedCount = 0;
            let conflictCount = 0;
            let duplicateCount = 0;

            courseData.forEach(course => {
                const scheduleCourse = {
                    course_id: course.course_id,
                    course_name: course.course_name,
                    english_course_name: course.english_course_name || '',
                    teacher: Array.isArray(course.teacher) ? course.teacher : [course.teacher],
                    classroom: Array.isArray(course.classroom) ? course.classroom : [course.classroom],
                    credits: course.credits?.toString() || '',
                    class_time: course.class_time.map((time: { day: string; period: string }) => ({
                        day: time.day?.toString() || '',
                        period: time.period?.toString() || ''
                    })),
                    semester: semester,
                    departments: course.departments || []
                };

                const success = ScheduleStorage.addCourse(semester, scheduleCourse);
                if (success) {
                    addedCount++;
                } else {
                    if (ScheduleStorage.checkTimeConflict(semester, scheduleCourse)) {
                        conflictCount++;
                    } else {
                        duplicateCount++;
                    }
                }
            });

            let message = `已成功加入 ${addedCount} 門課程`;
            if (conflictCount > 0) {
                message += `\n${conflictCount} 門課程因時間衝突無法加入`;
            }
            if (duplicateCount > 0) {
                message += `\n${duplicateCount} 門課程已存在於課表中`;
            }
            alert(message);
        }).catch(error => {
            console.error('Error adding courses:', error);
            alert('加入課程時發生錯誤，請稍後再試。');
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50">
                {/* 分享訊息美化：色塊、icon、圓角 */}
                {name && (
                    <div className="flex items-center gap-2 bg-indigo-50 rounded-t-lg px-6 py-2">
                        {/* <Info className="w-4 h-4 text-indigo-500" /> */}
                        <span className="text-xs text-indigo-700">
                            <span className="font-semibold">{name}</span> 與您分享他 <span className="font-semibold">{semester}</span> 的課表
                        </span>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{semester} 學期</h3>
                            <p className="text-sm text-gray-600">共 {courses.length} 門課程</p>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleAddToMySchedule}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        加到我的課表
                    </motion.button>
                </div>
            </div>
        </div>
    );
} 