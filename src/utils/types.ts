import { ScheduleCourse } from '@/types/schedule';

// 從 types/schedule.ts 重新導出 ScheduleCourse 型別
export type { ScheduleCourse } from '@/types/schedule';

// API 回傳的原始課程資料類型
export interface RawCourseData {
    course_id: string;
    course_name: string;
    english_course_name?: string;
    teacher: string | string[];
    classroom: string | string[];
    credits?: string;
    class_time: Array<{
        day: string;
        period: string;
    } | string>;
    semester?: string;
    departments?: Array<{
        college: string;
        department: string;
    }>;
}

// 課程資料轉換函數的型別
export type CourseTransformer = (data: RawCourseData[]) => ScheduleCourse[];

// 分享頁面的搜尋參數類型
export interface SharePageSearchParams {
    name?: string;
    semester?: string;
    courses?: string;
}

// 分享頁面的 Props 類型 - Updated for Next.js 15
export type SharePageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}