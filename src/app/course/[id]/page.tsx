import { Metadata } from "next";
import CourseDetailClient from "@/components/Course/CourseDetailClient";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams(): Promise<{ params: { id: string } }[]> {
    try {
        const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
        if (!res.ok) {
            console.error("❌ 無法取得 main.json");
            return [];
        }

        const courses = await res.json();

        return Object.values(courses).map((sqlNo) => ({
            params: { id: String(sqlNo) },  // ✅ 使用 `sql_no` 作為 `id`
        }));
    } catch (error) {
        console.error("❌ 無法解析 main.json:", error);
        return [];
    }
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
    console.log("📢 取得課程 ID:", params.id);  // ✅ 確保 `id` 是 `sql_no`

    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${params.id}.json`);

    if (!res.ok) {
        console.error("❌ 找不到課程:", params.id);
        return <div>找不到課程</div>;
    }

    const course = await res.json();
    return <CourseDetailClient course={course} />;
}
