import SearchClient from '@/components/Search/SearchClient';
import { Suspense } from 'react';

interface CourseInfo {
    id: string;
    name: string;
    college?: string;
    offering_department?: string;
    teacher?: string;
    credits?: string;
    classroom?: string;
    class_time?: Array<{
        day: string;
        period: string;
    }>;
}

interface PageProps {
    params: Promise<{ semester: string }>;
}

// 生成靜態參數
export async function generateStaticParams(): Promise<{ semester: string }[]> {
    try {
        const response = await fetch('https://yc97463.github.io/ndhu-course-crawler/semester.json');

        if (!response.ok) {
            console.warn('Failed to fetch semester list');
            return [];
        }

        const semesters: string[] = await response.json();

        // 匯出所有在 API 中列出的學期，讓 /search/[semester] 都可用
        const params: { semester: string }[] = semesters.map((semester: string) => ({ semester }));

        return params;
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// 從 API 獲取課程列表
async function getCourses(semester: string): Promise<CourseInfo[]> {
    try {
        // 標準化學期格式：期望為 114-1，若不是則嘗試轉換
        const normalizedSemester = semester.includes('-') && semester.length >= 5
            ? semester
            : (semester.length === 4
                ? `${semester.slice(0, 3)}-${semester.slice(3)}`
                : semester);

        // 使用 main.json 來獲取完整的課程時間資料
        const response = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${normalizedSemester}/main.json`,
            { next: { revalidate: 3600 } } // 快取 1 小時
        );

        if (!response.ok) {
            console.error('Failed to fetch courses');
            return [];
        }

        const data: Record<string, {
            course_id: string;
            course_name: string;
            college?: string;
            offering_department?: string;
            teacher?: string;
            credits?: string;
            classroom?: string;
            class_time?: string;
        }> = await response.json();

        // 轉換資料格式
        return Object.values(data).map((course) => {
            // 解析 class_time 字串格式：/二4/二5/二6
            let parsedClassTime: Array<{ day: string; period: string }> = [];
            if (course.class_time && typeof course.class_time === 'string') {
                const timeSlots = course.class_time.split('/').filter(Boolean);
                parsedClassTime = timeSlots.map((slot: string) => {
                    // 提取星期（第一個字）和節次（剩餘數字）
                    const day = slot.charAt(0);
                    const period = slot.substring(1);
                    return { day, period };
                });
            }

            return {
                id: course.course_id,
                name: course.course_name,
                college: course.college || '',
                offering_department: course.offering_department || '',
                teacher: course.teacher ? course.teacher.replace(/\//g, '').trim() : '',
                credits: course.credits || '',
                classroom: course.classroom ? course.classroom.split('/').filter(Boolean)[0] : '',
                class_time: parsedClassTime
            };
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

export default async function SearchPage({ params }: PageProps) {
    const { semester } = await params;
    const courses = await getCourses(semester);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 頁面標題 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">課程搜尋</h1>
                    <p className="text-gray-600">搜尋並篩選 {semester} 學期的課程</p>
                </div>

                {/* 搜尋介面 */}
                <Suspense fallback={
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-gray-600">載入搜尋介面...</p>
                    </div>
                }>
                    <SearchClient courses={courses} semester={semester} />
                </Suspense>
            </div>
        </div>
    );
}
