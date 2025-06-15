"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import HomeClient from "@/components/Home/HomeClient";
import SemesterSelector from "./SemesterSelector";

interface CourseData {
    [courseId: string]: {
        course_id: string;
        course_name: string;
        college?: string;
        offering_department?: string;
        teacher?: string;
        credits?: string;
        // other fields...
    };
}

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

const STORAGE_KEY = 'ndhu-course-selected-semesters';

export default function ClientHome() {
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
    const [semesterData, setSemesterData] = useState<SemesterData[]>([]);

    // Load saved semesters from localStorage on initial render
    useEffect(() => {
        const savedSemesters = localStorage.getItem(STORAGE_KEY);
        if (savedSemesters) {
            setSelectedSemesters(JSON.parse(savedSemesters));
        }
    }, []);

    // Use SWR for individual semester course data
    const semesterResults = useSWR<{ [key: string]: CourseInfo[] }>(() => {
        // Only fetch if we have selected semesters
        if (selectedSemesters.length === 0) return null;

        // Create a key that includes all selected semesters
        return `semester-courses-${selectedSemesters.join(',')}`;
    },
        async () => {
            // Fetch all selected semesters in parallel
            const results: { [key: string]: CourseInfo[] } = {};

            await Promise.all(
                selectedSemesters.map(async (semester) => {
                    try {
                        const courseRes = await fetch(
                            `https://yc97463.github.io/ndhu-course-crawler/${semester}/main.json`
                        );

                        if (!courseRes.ok) {
                            throw new Error(`Failed to fetch courses for semester ${semester}`);
                        }

                        const coursesData: CourseData = await courseRes.json();

                        // Transform the course data with complete information
                        results[semester] = Object.entries(coursesData).map(([courseId, courseDetails]) => ({
                            id: courseId,
                            name: courseDetails.course_name || courseId,
                            college: courseDetails.college,
                            offering_department: courseDetails.offering_department,
                            teacher: courseDetails.teacher,
                            credits: courseDetails.credits
                        }));
                    } catch (error) {
                        console.error(`Error fetching data for semester ${semester}:`, error);
                        results[semester] = []; // Use empty array on error
                    }
                })
            );

            return results;
        }
    );

    // Handle semester selection
    const handleSemesterSelect = (semester: string) => {
        setSelectedSemesters((prevSelected) => {
            // If already selected, remove it; otherwise add it
            const newSelected = prevSelected.includes(semester)
                ? prevSelected.filter(s => s !== semester)
                : [...prevSelected, semester];

            // Save to localStorage whenever selection changes
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelected));
            return newSelected;
        });
    };

    // Update semesterData when selected semesters change or data is loaded
    useEffect(() => {
        if (semesterResults.data) {
            const formattedData = selectedSemesters.map(semester => ({
                semester,
                courses: semesterResults.data?.[semester] || []
            }));

            setSemesterData(formattedData);
        }
    }, [selectedSemesters, semesterResults.data]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 標題區域 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        探索課程
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        選擇學期，瀏覽課程，建立您的專屬課表
                    </p>
                </div>

                {/* 學期選擇器 */}
                <div className="mb-8">
                    <SemesterSelector
                        onSelect={handleSemesterSelect}
                        selectedSemesters={selectedSemesters}
                    />
                </div>

                {/* 載入狀態 */}
                {semesterResults.isLoading && selectedSemesters.length > 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                        <p className="text-gray-600 font-medium">載入課程資料中...</p>
                    </div>
                )}

                {/* 錯誤狀態 */}
                {semesterResults.error && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">載入失敗</h3>
                        <p className="text-gray-600">載入課程資料時發生錯誤，請稍後再試</p>
                    </div>
                )}

                {/* 空狀態 */}
                {selectedSemesters.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">選擇學期開始探索</h3>
                        <p className="text-gray-600">請選擇一個或多個學期以查看課程列表</p>
                    </div>
                )}

                {/* 課程列表 */}
                {semesterData.length > 0 && <HomeClient semesterData={semesterData} />}
            </div>
        </div>
    );
}
