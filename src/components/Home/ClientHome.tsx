"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import HomeClient from "@/components/Home/HomeClient";
import SemesterSelector from "./SemesterSelector";

interface CourseData {
    [courseId: string]: {
        course_id: string;
        course_name: string;
        // other fields...
    };
}

interface CourseInfo {
    id: string;
    name: string;
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
    }, async () => {
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

                    // Transform the course data
                    results[semester] = Object.entries(coursesData).map(([courseId, courseDetails]) => ({
                        id: courseId,
                        name: courseDetails.course_name || courseId
                    }));
                } catch (error) {
                    console.error(`Error fetching data for semester ${semester}:`, error);
                    results[semester] = []; // Use empty array on error
                }
            })
        );

        return results;
    });

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-indigo-800 mb-8 text-center">
                    NDHU 課程列表
                </h1>

                <SemesterSelector
                    onSelect={handleSemesterSelect}
                    selectedSemesters={selectedSemesters}
                />

                {semesterResults.isLoading && selectedSemesters.length > 0 && (
                    <div className="text-center p-8 bg-white rounded-lg shadow">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-indigo-700">載入課程資料中...</p>
                    </div>
                )}

                {semesterResults.error && (
                    <div className="text-center p-8 bg-white rounded-lg shadow">
                        <p className="text-red-500">載入課程資料時發生錯誤，請稍後再試</p>
                    </div>
                )}

                {selectedSemesters.length === 0 && (
                    <div className="text-center p-8 bg-white rounded-lg shadow">
                        <p className="text-gray-600">請選擇一個學期以查看課程</p>
                    </div>
                )}

                {semesterData.length > 0 && <HomeClient semesterData={semesterData} />}
            </div>
        </div>
    );
}
