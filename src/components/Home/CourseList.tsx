// Client component for hover effects
"use client";

import Link from "next/link";

// Updated interface to represent course objects with ID and name
interface CourseInfo {
    id: string;
    name: string;
}

interface CourseListProps {
    courses: CourseInfo[];
    semester: string;
}

export default function CourseList({ courses, semester }: CourseListProps) {
    return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
                <li
                    key={`${semester}-${course.id}`}
                    className="bg-indigo-50 rounded-md overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:bg-indigo-100"
                >
                    <Link
                        href={`/course/${semester}/${course.id}`}
                        className="block p-4 text-indigo-700 transition-colors duration-150"
                    >
                        <span className="font-medium">{course.id}</span>
                        <p className="mt-1 text-sm text-indigo-600">{course.name}</p>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
