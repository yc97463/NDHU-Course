import type { Metadata } from "next";
import CourseDetailClient from "@/components/Course/CourseDetailClient";

interface PageProps {
    params: Promise<{ semester: string; id: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams(): Promise<{ semester: string; id: string }[]> {
    const params: Array<{ semester: string; id: string }> = [];
    try {
        const semestersRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/semester.json");
        if (!semestersRes.ok) {
            console.warn("Failed to fetch semester list");
            return [];
        }

        const semesters: string[] = await semestersRes.json();
        // To keep the export size manageable and avoid timeouts, pre-generate only for the latest semester.
        const targetSemesters = semesters.slice(0, 1);

        for (const semester of targetSemesters) {
            const coursesRes = await fetch(`https://yc97463.github.io/ndhu-course-crawler/${semester}/main.json`);
            if (!coursesRes.ok) {
                console.warn(`Failed to fetch courses for semester ${semester}`);
                continue;
            }

            const courses = await coursesRes.json();

            for (const courseId of Object.keys(courses)) {
                // Keep URL params in the canonical format: e.g. 114-1
                params.push({ semester, id: courseId });
            }
        }

        return params;
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { semester, id } = await params;
    if (!semester || !id) return { title: "找不到課程" };

    try {
        // Normalize semester to API format (114-1). If already hyphenated, keep as-is.
        const apiSemester = semester.includes('-') && semester.length >= 5
            ? semester
            : (semester.length === 4
                ? `${semester.slice(0, 3)}-${semester.slice(3)}`
                : semester);
        const courseRes = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${apiSemester}/course/${id}.json`
        );

        if (!courseRes.ok) return { title: "找不到課程" };

        const course = await courseRes.json();

        return {
            title: `${course.course_name} (${course.course_id})`,
            description: `教師：${course.teacher.join(", ")} - 學分數：${course.credits}`,
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return { title: "找不到課程" };
    }
}

export default async function CourseDetail({ params }: PageProps) {
    const { semester, id } = await params;
    if (!semester || !id) return <div>找不到課程</div>;

    try {
        // Normalize semester to API format (114-1). If already hyphenated, keep as-is.
        const apiSemester = semester.includes('-') && semester.length >= 5
            ? semester
            : (semester.length === 4
                ? `${semester.slice(0, 3)}-${semester.slice(3)}`
                : semester);
        const res = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${apiSemester}/course/${id}.json`,
            { cache: "force-cache" }
        );

        if (!res.ok) return <div>找不到課程</div>;

        const course = await res.json();

        return <CourseDetailClient course={course} semester={semester} courseId={id} />;
    } catch (error) {
        console.error("Error fetching course:", error);
        return <div>載入課程時發生錯誤</div>;
    }
}