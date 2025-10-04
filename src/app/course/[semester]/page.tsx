import RedirectToSearchClient from "@/components/Course/RedirectToSearchClient";

export async function generateStaticParams(): Promise<{ semester: string }[]> {
    try {
        const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/semester.json");
        if (!res.ok) return [];
        const semesters: string[] = await res.json();
        return semesters.map((semester) => ({ semester }));
    } catch {
        return [];
    }
}

export default async function CourseSemesterIndex({
    params,
}: {
    params: Promise<{ semester: string }>;
}) {
    const { semester } = await params;
    return <RedirectToSearchClient semester={semester} />;
}
