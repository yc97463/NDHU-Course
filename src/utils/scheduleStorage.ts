import { ScheduleData, ScheduleCourse } from '@/types/schedule';

const SCHEDULE_STORAGE_KEY = 'ndhu-course-schedule';

export class ScheduleStorage {
    // 獲取所有時刻表資料
    static getScheduleData(): ScheduleData {
        if (typeof window === 'undefined') return {};

        try {
            const data = localStorage.getItem(SCHEDULE_STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading schedule data:', error);
            return {};
        }
    }

    // 儲存時刻表資料
    static saveScheduleData(data: ScheduleData): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving schedule data:', error);
        }
    }

    // 獲取特定學期的課程
    static getSemesterCourses(semester: string): ScheduleCourse[] {
        const data = this.getScheduleData();
        return data[semester] || [];
    }

    // 添加課程到時刻表
    static addCourse(semester: string, course: ScheduleCourse): boolean {
        const data = this.getScheduleData();

        if (!data[semester]) {
            data[semester] = [];
        }

        // 檢查是否已存在
        const exists = data[semester].some(c => c.course_id === course.course_id);
        if (exists) {
            return false; // 課程已存在
        }

        // 檢查時間衝突
        const hasConflict = this.checkTimeConflict(semester, course);
        if (hasConflict) {
            return false; // 時間衝突
        }

        data[semester].push(course);
        this.saveScheduleData(data);
        return true;
    }

    // 從時刻表移除課程
    static removeCourse(semester: string, courseId: string): void {
        const data = this.getScheduleData();

        if (data[semester]) {
            data[semester] = data[semester].filter(c => c.course_id !== courseId);
            this.saveScheduleData(data);
        }
    }

    // 檢查課程是否已在時刻表中
    static isCourseInSchedule(semester: string, courseId: string): boolean {
        const courses = this.getSemesterCourses(semester);
        return courses.some(c => c.course_id === courseId);
    }

    // 檢查時間衝突
    static checkTimeConflict(semester: string, newCourse: ScheduleCourse): boolean {
        const existingCourses = this.getSemesterCourses(semester);

        for (const existingCourse of existingCourses) {
            for (const newTime of newCourse.class_time) {
                for (const existingTime of existingCourse.class_time) {
                    if (newTime.day === existingTime.day &&
                        String(newTime.period) === String(existingTime.period)) {
                        return true; // 發現衝突
                    }
                }
            }
        }

        return false;
    }

    // 獲取所有有課程的學期
    static getAvailableSemesters(): string[] {
        const data = this.getScheduleData();
        return Object.keys(data).filter(semester => data[semester].length > 0);
    }

    // 清空特定學期的時刻表
    static clearSemester(semester: string): void {
        const data = this.getScheduleData();
        delete data[semester];
        this.saveScheduleData(data);
    }

    // 清空所有時刻表
    static clearAll(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(SCHEDULE_STORAGE_KEY);
    }
} 