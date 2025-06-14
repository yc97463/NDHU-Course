"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScheduleStorage } from "@/utils/scheduleStorage";
import { ScheduleCourse } from "@/types/schedule";
import WeeklySchedule from "./WeeklySchedule";
import SemesterScheduleSelector from "./SemesterScheduleSelector";
import { Calendar, Trash2, RefreshCw, BookOpen, Share2, Copy, Pencil } from "lucide-react";

const USER_NAME_STORAGE_KEY = 'ndhu-course-user-name';

interface ScheduleClientProps {
    sharedName?: string;
    sharedSemester?: string;
    sharedCourseIds?: string[];
}

export default function ScheduleClient({
    sharedName,
    sharedSemester,
    sharedCourseIds
}: ScheduleClientProps) {
    const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [courses, setCourses] = useState<ScheduleCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isSharedView, setIsSharedView] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);

    // 從 API 獲取課程資料
    const fetchCourseData = async (courseIds: string[]) => {
        try {
            const coursePromises = courseIds.map(async (courseId) => {
                const response = await fetch(`/api/course/${selectedSemester}/${courseId}`);
                if (!response.ok) throw new Error('Failed to fetch course data');
                return response.json();
            });
            const courseData = await Promise.all(coursePromises);
            setCourses(courseData);
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    };

    // 載入資料
    useEffect(() => {
        if (sharedName && sharedSemester && sharedCourseIds) {
            // 共享視圖模式
            setUserName(sharedName);
            setSelectedSemester(sharedSemester);
            setIsSharedView(true);
            fetchCourseData(sharedCourseIds);
        } else {
            // 一般視圖模式
            loadScheduleData();
            // 從 localStorage 讀取使用者名稱
            const storedName = localStorage.getItem(USER_NAME_STORAGE_KEY);
            if (storedName) {
                setUserName(storedName);
            }
        }
    }, [sharedName, sharedSemester, sharedCourseIds]);

    // 儲存使用者名稱到 localStorage
    const saveUserName = (name: string) => {
        setUserName(name);
        localStorage.setItem(USER_NAME_STORAGE_KEY, name);
    };

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

    const generateShareLink = () => {
        if (!selectedSemester || courses.length === 0) return '';

        // 生成課程 ID 字串
        const courseIds = courses.map(course => course.course_id).join(',');

        // 生成分享連結
        const baseUrl = window.location.origin;
        const encodedName = btoa(encodeURIComponent(userName || 'anonymous')).replace(/=/g, '');
        return `${baseUrl}/schedule/${encodedName}/${selectedSemester}/${courseIds}`;
    };

    const handleCopyLink = async () => {
        const shareLink = generateShareLink();
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                        <p className="text-gray-600 font-medium">載入時刻表中...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 標題區域 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                            {isSharedView ? (
                                `${userName}的課表`
                            ) : isEditingName ? (
                                <>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => saveUserName(e.target.value)}
                                        onBlur={() => setIsEditingName(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setIsEditingName(false);
                                            }
                                        }}
                                        autoFocus
                                        className="w-32 px-2 py-1 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-4xl font-bold text-gray-900"
                                    />
                                    的課表
                                </>
                            ) : (
                                <>
                                    <span
                                        onClick={() => setIsEditingName(true)}
                                        className="group relative inline-block cursor-pointer py-2"
                                    >
                                        <span className="text-4xl font-bold text-gray-900">
                                            {userName || '我'}
                                        </span>
                                        <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Pencil className="w-4 h-4 text-indigo-500 absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </span>
                                    的課表
                                </>
                            )}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            管理您的課程安排，掌握學習節奏
                        </p>
                    </div>
                </motion.div>

                {/* 控制區域 */}
                {!isSharedView && (
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <SemesterScheduleSelector
                                        availableSemesters={availableSemesters}
                                        selectedSemester={selectedSemester}
                                        onSemesterChange={setSelectedSemester}
                                    />
                                </div>

                                {selectedSemester && courses.length > 0 && (
                                    <div className="flex gap-3">
                                        <motion.button
                                            onClick={handleCopyLink}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Copy className="w-4 h-4 mr-2 text-indigo-600" />
                                                    已複製！
                                                </>
                                            ) : (
                                                <>
                                                    <Share2 className="w-4 h-4 mr-2 text-indigo-600" />
                                                    分享課表
                                                </>
                                            )}
                                        </motion.button>

                                        <motion.button
                                            onClick={handleClearSemester}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            清空學期
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 時刻表 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {availableSemesters.length === 0 && !isSharedView ? (
                        <>
                            {/* 空狀態提示 */}
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200/50 mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">還沒有任何課程</h3>
                                <p className="text-gray-600 mb-6">
                                    請到課程詳細頁面將課程加入到時刻表中
                                </p>
                                <motion.a
                                    href="/"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    瀏覽課程
                                </motion.a>
                            </div>

                            {/* 顯示空的時刻表 */}
                            <WeeklySchedule
                                courses={[]}
                                semester=""
                                onRemoveCourse={handleRemoveCourse}
                                isShared={isSharedView}
                            />
                        </>
                    ) : (
                        <WeeklySchedule
                            courses={courses}
                            semester={selectedSemester}
                            onRemoveCourse={handleRemoveCourse}
                            isShared={isSharedView}
                        />
                    )}
                </motion.div>

                {/* 使用說明 */}
                {availableSemesters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">使用說明</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>點擊課程方塊可以查看課程詳細資訊</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>滑鼠移到課程上會顯示移除按鈕</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>可以切換不同學期查看時刻表</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>資料會自動儲存在瀏覽器中</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
} 