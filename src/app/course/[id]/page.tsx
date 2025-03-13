// ✅ Server Component: Fetch Data & Pass to Client Component
export async function generateStaticParams() {
    const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json");
    const courses = await res.json();

    const paths = Object.keys(courses).map((sqlId) => ({
        id: sqlId,
    }));

    return paths;
}

import CourseDetailClient from "./CourseDetailClient";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${params.id}.json`);
    if (!res.ok) return { title: "找不到課程" };

    const course = await res.json();

    return {
        title: `${course.course_name} (${course.course_id})`,
        description: `教師: ${course.teacher.join(", ")} - 學分數: ${course.credits}`,
    };
}

export default async function CourseDetail({ params }: { params: { id: string } }) {
    // ✅ Fetch data in build-time (Static Rendering)
    const res = await fetch(`https://yc97463.github.io/ndhu-course-crawler/course/${params.id}.json`, {
        cache: "force-cache"
    });

    if (!res.ok) return <div>找不到課程</div>;

    const course = await res.json();

    return <CourseDetailClient course={course} />;
}
