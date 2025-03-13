import { Metadata } from "next";
import CourseDetailClient from "@/components/Course/CourseDetailClient";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams(): Promise<{ params: { id: string } }[]> {
    const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
    const courses = await res.json();

    return Object.keys(courses).map((sqlId) => ({
        params: { id: sqlId },
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    if (!params?.id) return { title: "找不到課程" };

    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${params.id}.json`);
    if (!res.ok) return { title: "找不到課程" };

    const course = await res.json();

    return {
        title: `${course.course_name} (${course.course_id})`,
        description: `教師: ${course.teacher.join(", ")} - 學分數: ${course.credits}`,
    };
}

export default async function CourseDetail({ params }: PageProps) {
    if (!params?.id) return <div>找不到課程</div>;

    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${params.id}.json`, {
        cache: "force-cache",
    });

    if (!res.ok) return <div>找不到課程</div>;

    const course = await res.json();

    return <CourseDetailClient course={course} />;
}