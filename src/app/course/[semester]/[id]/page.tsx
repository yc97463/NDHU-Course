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

        const semesters = await semestersRes.json();

        for (const semester of semesters) {
            const coursesRes = await fetch(`https://yc97463.github.io/ndhu-course-crawler/${semester}/main.json`);
            if (!coursesRes.ok) {
                console.warn(`Failed to fetch courses for semester ${semester}`);
                continue;
            }

            const courses = await coursesRes.json();

            for (const courseId of Object.keys(courses)) {
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
        const courseRes = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${id}.json`
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
        const res = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${id}.json`,
            { cache: "force-cache" }
        );

        if (!res.ok) return <div>找不到課程</div>;

        const course = await res.json();

        return <CourseDetailClient course={course} />;
    } catch (error) {
        console.error("Error fetching course:", error);
        return <div>載入課程時發生錯誤</div>;
    }
}