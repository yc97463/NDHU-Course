import { Metadata } from "next";
import SyllabusViewerClient from "@/components/Course/SyllabusViewerClient";

export async function generateStaticParams(): Promise<{ semester: string; id: string }[]> {
    const params: Array<{ semester: string; id: string }> = [];
    try {
        const semestersRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/semester.json");
        if (!semestersRes.ok) {
            console.warn("Failed to fetch semester list");
            return [];
        }

        const semesters: string[] = await semestersRes.json();
        // Pre-generate for all semesters listed in the API to support full browsing
        const targetSemesters = semesters;

        for (const semester of targetSemesters) {
            const coursesRes = await fetch(`https://yc97463.github.io/ndhu-course-crawler/${semester}/main.json`);
            if (!coursesRes.ok) {
                console.warn(`Failed to fetch courses for semester ${semester}`);
                continue;
            }

            const courses = await coursesRes.json();

            for (const courseId of Object.keys(courses)) {
                // Use canonical hyphenated semester in URL params (e.g., 114-1)
                params.push({ semester, id: courseId });
            }
        }

        return params;
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export async function generateMetadata(props: {
    params: Promise<{
        semester: string;
        id: string;
    }>
}): Promise<Metadata> {
    const params = await props.params;
    const { semester, id } = params;
    if (!semester || !id) return { title: "找不到課程計劃表" };

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

        if (!courseRes.ok) return { title: "找不到課程計劃表" };

        const course = await courseRes.json();

        return {
            title: `${course.course_name} - 教學計劃表`,
            description: `${course.course_name} (${course.course_id}) 的教學計劃表`,
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return { title: "找不到課程計劃表" };
    }
}

// In App Router for Next.js 15+, params is now a Promise
export default async function SyllabusPage(props: {
    params: Promise<{
        semester: string;
        id: string;
    }>
}) {
    const params = await props.params;
    const { semester, id } = params;
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

        return (
            <SyllabusViewerClient
                course={course}
                semester={semester}
                id={id}
            />
        );
    } catch (error) {
        console.error("Error fetching course:", error);
        return <div>載入課程時發生錯誤</div>;
    }
}