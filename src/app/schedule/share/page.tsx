import { Suspense } from "react";
import ScheduleClient from "@/components/Schedule/ScheduleClient";
import ScheduleOperations from "@/components/Schedule/ScheduleOperations";
import { SharePageProps } from "@/utils/types";

export default async function SharedSchedulePage({ searchParams }: SharePageProps) {
    const { name, semester, courses } = await searchParams;

    // 檢查必要參數
    if (!name || !semester || !courses) {
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

    // 解碼 base64 編碼的暱稱
    let decodedName;
    try {
        decodedName = decodeURIComponent(
            atob(name + '='.repeat((4 - name.length % 4) % 4))
        );
    } catch (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-16">
                        <p className="text-gray-600 font-medium">無效的分享連結</p>
                        <p className="text-gray-500">{String(error)}</p>
                    </div>
                </div>
            </div>
        );
    }

    const courseIds = courses.split(',');

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
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <ScheduleOperations name={decodedName} semester={semester} courses={courseIds} />
                    <ScheduleClient
                        sharedName={decodedName}
                        sharedSemester={semester}
                        sharedCourseIds={courseIds}
                    />
                </div>
            </div>
        </Suspense>
    );
} 