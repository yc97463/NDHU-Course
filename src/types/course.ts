import { ScheduleCourse } from './schedule';

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