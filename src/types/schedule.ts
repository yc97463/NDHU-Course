export interface ScheduleCourse {
    course_id: string;
    course_name: string;
    english_course_name: string;
    teacher: string[];
    classroom: string[];
    credits: string;
    class_time: {
        day: string;
        period: string | number;
    }[];
    semester: string;
    departments: {
        college: string;
        department: string;
    }[];
}

export interface ScheduleData {
    [semester: string]: ScheduleCourse[];
}

export interface TimeSlot {
    period: number;
    time: string;
}

export interface DaySchedule {
    day: string;
    displayName: string;
    courses: {
        [period: number]: ScheduleCourse | null;
    };
} 