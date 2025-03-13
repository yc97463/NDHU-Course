import { Metadata } from "next";
import CourseDetailClient from "@/components/Course/CourseDetailClient";

interface PageProps {
    params: Promise<{ semester: string, id: string }>;
}

export async function generateStaticParams() {
    try {
        const semesters = ["113-2"];
        let params: {
            semester: string;
            id: string;
        }[] = [];

        // Fetch course list once since we're using a single endpoint
        const coursesRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
        if (!coursesRes.ok) {
            console.warn(`Failed to fetch course list`);
            return [];
        }

        const courses = await coursesRes.json();

        // Generate params for each course in the courses object
        for (const courseCode of Object.keys(courses)) {
            params.push({
                semester: "113-2", // Currently hardcoded to 113-2
                id: courseCode,
            });
        }

        return params;
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    if (!resolvedParams?.semester || !resolvedParams?.id) return { title: "找不到課程" };

    // 1️⃣ 先取得 courseId 對應的 sqlId
    const coursesRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
    if (!coursesRes.ok) return { title: "找不到課程" };

    const courses = await coursesRes.json();

    // 透過 courseId 找出 sqlId
    const sqlId = courses[resolvedParams.id];  // 這裡 resolvedParams.id 是 courseId

    if (!sqlId) return { title: "找不到課程" };

    // 2️⃣ 使用 sqlId 來請求課程詳細資料
    const courseRes = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${sqlId}.json`);
    if (!courseRes.ok) return { title: "找不到課程" };

    const course = await courseRes.json();

    return {
        title: `${course.course_name} (${course.course_id})`,
        description: `教師: ${course.teacher.join(", ")} - 學分數: ${course.credits}`,
    };
}


export default async function CourseDetail({ params }: PageProps) {
    const resolvedParams = await params;
    if (!resolvedParams?.semester || !resolvedParams?.id) return <div>找不到課程</div>;

    // 1️⃣ 先取得 courseId 對應的 sqlId
    const coursesRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json", {
        cache: "force-cache",
    });

    if (!coursesRes.ok) return <div>找不到課程</div>;

    const courses = await coursesRes.json();

    // 透過 courseId 找出 sqlId
    const sqlId = courses[resolvedParams.id];

    if (!sqlId) return <div>找不到課程</div>;

    // 2️⃣ 使用 sqlId 來請求課程詳細資料
    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${sqlId}.json`, {
        cache: "force-cache",
    });

    if (!res.ok) return <div>找不到課程</div>;

    const course = await res.json();

    return <CourseDetailClient course={course} />;
}
