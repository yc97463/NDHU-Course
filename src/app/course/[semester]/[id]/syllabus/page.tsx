import { Metadata } from "next";
import SyllabusViewerClient from "@/components/Course/SyllabusViewerClient";

interface PageProps {
    params: {
        semester: string;
        id: string;
    };
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
    const { semester, id } = params;
    if (!semester || !id) return { title: "找不到課程計劃表" };

    try {
        const courseRes = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${id}.json`
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

export default async function SyllabusPage({ params }: PageProps) {
    const { semester, id } = params;
    if (!semester || !id) return <div>找不到課程</div>;

    try {
        const res = await fetch(
            `https://yc97463.github.io/ndhu-course-crawler/${semester}/course/${id}.json`,
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
