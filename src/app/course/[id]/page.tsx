import { Metadata } from "next";
import CourseDetailClient from "@/components/Course/CourseDetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    try {
        const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
        if (!res.ok) {
            console.error('Failed to fetch course list');
            return [];
        }

        const courses = await res.json();

        return Object.values(courses).map((sqlNo) => ({
            id: String(sqlNo)
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    if (!resolvedParams?.id) return { title: "找不到課程" };

    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${resolvedParams.id}.json`);
    if (!res.ok) return { title: "找不到課程" };

    const course = await res.json();

    return {
        title: `${course.course_name} (${course.course_id})`,
        description: `教師: ${course.teacher.join(", ")} - 學分數: ${course.credits}`,
    };
}

export default async function CourseDetail({ params }: PageProps) {
    const resolvedParams = await params;
    if (!resolvedParams?.id) return <div>找不到課程</div>;

    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${resolvedParams.id}.json`, {
        cache: "force-cache",
    });

    if (!res.ok) return <div>找不到課程</div>;

    const course = await res.json();

    return <CourseDetailClient course={course} />;
}