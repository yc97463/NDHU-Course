// Client component for animations
"use client";

import { motion } from "framer-motion";
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
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
            {courses.map((course) => (
                <motion.li
                    key={`${semester}-${course.id}`} // Use a combination of semester and course ID for unique keys
                    variants={item}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-indigo-50 rounded-md overflow-hidden transition-all hover:shadow-md"
                >
                    <Link
                        href={`/course/${semester}/${course.id}`}
                        className="block p-4 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                        <span className="font-medium">{course.id}</span>
                        <p className="mt-1 text-sm text-indigo-600">{course.name}</p>
                    </Link>
                </motion.li>
            ))}
        </motion.ul>
    );
}
