import { ScheduleData, ScheduleCourse } from '@/types/schedule';

const SCHEDULE_STORAGE_KEY = 'ndhu-course-schedule';

export class ScheduleStorage {
    // 獲取所有課表資料
    static getScheduleData(): ScheduleData {
        if (typeof window === 'undefined') return {};

        try {
            const data = localStorage.getItem(SCHEDULE_STORAGE_KEY);
            if (!data) return {};

            const parsedData = JSON.parse(data);
            // 確保數據格式正確
            if (typeof parsedData !== 'object' || parsedData === null) {
                console.error('Invalid schedule data format');
                return {};
            }
            return parsedData;
        } catch (error) {
            console.error('Error reading schedule data:', error);
            return {};
        }
    }

    // 儲存課表資料
    static saveScheduleData(data: ScheduleData): void {
        if (typeof window === 'undefined') return;

        try {
            // 確保數據格式正確
            if (typeof data !== 'object' || data === null) {
                console.error('Invalid schedule data format');
                return;
            }
            localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving schedule data:', error);
        }
    }

    // 獲取特定學期的課程
    static getSemesterCourses(semester: string): ScheduleCourse[] {
        const data = this.getScheduleData();
        const courses = data[semester] || [];

        // 確保返回的是有效的課程數組
        if (!Array.isArray(courses)) {
            console.error('Invalid courses data format');
            return [];
        }

        return courses;
    }

    // 添加課程到課表
    static addCourse(semester: string, course: ScheduleCourse): boolean {
        if (!semester || !course || !course.course_id) {
            console.error('Invalid course data');
            return false;
        }

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

    // 從課表移除課程
    static removeCourse(semester: string, courseId: string): void {
        if (!semester || !courseId) {
            console.error('Invalid semester or courseId');
            return;
        }

        const data = this.getScheduleData();

        if (data[semester]) {
            data[semester] = data[semester].filter(c => c.course_id !== courseId);
            this.saveScheduleData(data);
        }
    }

    // 檢查課程是否已在課表中
    static isCourseInSchedule(semester: string, courseId: string): boolean {
        if (!semester || !courseId) return false;

        const courses = this.getSemesterCourses(semester);
        return courses.some(c => c.course_id === courseId);
    }

    // 檢查時間衝突
    static checkTimeConflict(semester: string, newCourse: ScheduleCourse): boolean {
        if (!semester || !newCourse || !newCourse.class_time) {
            return false;
        }

        const existingCourses = this.getSemesterCourses(semester);

        for (const existingCourse of existingCourses) {
            if (!existingCourse.class_time) continue;

            for (const newTime of newCourse.class_time) {
                if (!newTime || !newTime.day || !newTime.period) continue;

                for (const existingTime of existingCourse.class_time) {
                    if (!existingTime || !existingTime.day || !existingTime.period) continue;

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
        return Object.keys(data).filter(semester => {
            const courses = data[semester];
            return Array.isArray(courses) && courses.length > 0;
        });
    }

    // 清空特定學期的課表
    static clearSemester(semester: string): void {
        if (!semester) return;

        const data = this.getScheduleData();
        delete data[semester];
        this.saveScheduleData(data);
    }

    // 清空所有課表
    static clearAll(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(SCHEDULE_STORAGE_KEY);
    }
} 