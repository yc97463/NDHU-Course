// page.tsx - 客戶端渲染版本
'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScheduleClient from "@/components/Schedule/ScheduleClient";
import ScheduleOperations from "@/components/Schedule/ScheduleOperations";

// 把使用 useSearchParams 的邏輯分離到獨立的組件中
function SharedScheduleContent() {
    const searchParams = useSearchParams();
    const [pageData, setPageData] = useState<{
        name: string;
        semester: string;
        courses: string[];
        decodedName: string;
        error?: string;
    } | null>(null);

    useEffect(() => {
        const name = searchParams.get('name');
        const semester = searchParams.get('semester');
        const courses = searchParams.get('courses');

        // 檢查必要參數
        if (!name || !semester || !courses) {
            setPageData(null);
            return;
        }

        // 解碼 base64 編碼的暱稱
        try {
            const decodedName = decodeURIComponent(
                atob(name + '='.repeat((4 - name.length % 4) % 4))
            );

            setPageData({
                name,
                semester,
                courses: courses.split(','),
                decodedName
            });
        } catch (error) {
            setPageData({
                name,
                semester,
                courses: courses.split(','),
                decodedName: '',
                error: String(error)
            });
        }
    }, [searchParams]);

    // 載入中狀態
    if (pageData === null) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-16">
                        <p className="text-gray-600 font-medium">無效的分享連結</p>
                    </div>
                </div>
            </div>
        );
    }

    // 錯誤狀態
    if (pageData.error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-16">
                        <p className="text-gray-600 font-medium">無效的分享連結</p>
                        <p className="text-gray-500">{pageData.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <ScheduleOperations
                    name={pageData.decodedName}
                    semester={pageData.semester}
                    courses={pageData.courses}
                />
                <ScheduleClient
                    sharedName={pageData.decodedName}
                    sharedSemester={pageData.semester}
                    sharedCourseIds={pageData.courses}
                />
            </div>
        </div>
    );
}

// 主要的頁面組件
export default function SharedSchedulePage() {
    return (
        <Suspense fallback={
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
        }>
            <SharedScheduleContent />
        </Suspense>
    );
}