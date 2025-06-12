"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScheduleStorage } from "@/utils/scheduleStorage";
import { ScheduleCourse } from "@/types/schedule";
import WeeklySchedule from "./WeeklySchedule";
import SemesterScheduleSelector from "./SemesterScheduleSelector";
import { Calendar, Trash2, RefreshCw } from "lucide-react";

export default function ScheduleClient() {
    const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [courses, setCourses] = useState<ScheduleCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 載入資料
    useEffect(() => {
        loadScheduleData();
    }, []);

    // 當選擇的學期改變時載入該學期的課程
    useEffect(() => {
        if (selectedSemester) {
            const semesterCourses = ScheduleStorage.getSemesterCourses(selectedSemester);
            setCourses(semesterCourses);
        } else {
            setCourses([]);
        }
    }, [selectedSemester]);

    const loadScheduleData = () => {
        setIsLoading(true);
        try {
            const semesters = ScheduleStorage.getAvailableSemesters();
            setAvailableSemesters(semesters);

            // 如果有學期資料，預設選擇最新的學期
            if (semesters.length > 0) {
                const sortedSemesters = [...semesters].sort((a, b) => {
                    const [yearA, termA] = a.split("-").map(Number);
                    const [yearB, termB] = b.split("-").map(Number);
                    return yearB === yearA ? termB - termA : yearB - yearA;
                });
                setSelectedSemester(sortedSemesters[0]);
            }
        } catch (error) {
            console.error("Error loading schedule data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCourse = (courseId: string) => {
        if (selectedSemester) {
            ScheduleStorage.removeCourse(selectedSemester, courseId);

            // 重新載入資料
            const updatedCourses = ScheduleStorage.getSemesterCourses(selectedSemester);
            setCourses(updatedCourses);

            // 如果該學期沒有課程了，更新可用學期列表
            if (updatedCourses.length === 0) {
                const updatedSemesters = ScheduleStorage.getAvailableSemesters();
                setAvailableSemesters(updatedSemesters);

                if (updatedSemesters.length > 0) {
                    const sortedSemesters = [...updatedSemesters].sort((a, b) => {
                        const [yearA, termA] = a.split("-").map(Number);
                        const [yearB, termB] = b.split("-").map(Number);
                        return yearB === yearA ? termB - termA : yearB - yearA;
                    });
                    setSelectedSemester(sortedSemesters[0]);
                } else {
                    setSelectedSemester("");
                }
            }
        }
    };

    const handleClearSemester = () => {
        if (selectedSemester && confirm(`確定要清空 ${selectedSemester} 學期的所有課程嗎？`)) {
            ScheduleStorage.clearSemester(selectedSemester);
            loadScheduleData();
        }
    };

    const handleRefresh = () => {
        loadScheduleData();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-indigo-700">載入時刻表中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* 標題區域 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-indigo-800 mb-4 flex items-center justify-center">
                        <Calendar className="w-10 h-10 mr-3" />
                        我的課程時刻表
                    </h1>
                    <p className="text-indigo-600">管理您的課程安排</p>
                </motion.div>

                {/* 控制區域 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <SemesterScheduleSelector
                                    availableSemesters={availableSemesters}
                                    selectedSemester={selectedSemester}
                                    onSemesterChange={setSelectedSemester}
                                />
                            </div>

                            {selectedSemester && courses.length > 0 && (
                                <div className="flex gap-2">
                                    <motion.button
                                        onClick={handleRefresh}
                                        className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        重新整理
                                    </motion.button>

                                    <motion.button
                                        onClick={handleClearSemester}
                                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        清空學期
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 時刻表區域 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {availableSemesters.length === 0 ? (
                        <>
                            {/* 空狀態提示 */}
                            <div className="text-center py-8 bg-white rounded-lg shadow-md mb-6">
                                <div className="text-gray-400 text-6xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">還沒有任何課程</h3>
                                <p className="text-gray-500 mb-4">
                                    請到課程詳細頁面將課程加入到時刻表中
                                </p>
                                <motion.a
                                    href="/"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    瀏覽課程
                                </motion.a>
                            </div>

                            {/* 顯示空的時刻表 */}
                            <WeeklySchedule
                                courses={[]}
                                semester=""
                                onRemoveCourse={handleRemoveCourse}
                            />
                        </>
                    ) : (
                        <WeeklySchedule
                            courses={courses}
                            semester={selectedSemester}
                            onRemoveCourse={handleRemoveCourse}
                        />
                    )}
                </motion.div>

                {/* 使用說明 */}
                {availableSemesters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-8 bg-white rounded-lg shadow-md p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">使用說明</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>點擊課程方塊可以查看課程詳細資訊</span>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>滑鼠移到課程上會顯示移除按鈕</span>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>可以切換不同學期查看時刻表</span>
                            </div>
                            <div className="flex items-start">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span>資料會自動儲存在瀏覽器中</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
} 