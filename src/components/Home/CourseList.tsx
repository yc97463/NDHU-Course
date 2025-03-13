// Client component for animations
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Course {
    [sqlId: string]: string;
}

export default function CourseList({ courses }: { courses: Course }) {
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
            {Object.entries(courses).map(([courseId, sqlId]) => (
                <motion.li
                    key={courseId}
                    variants={item}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-indigo-50 rounded-md overflow-hidden transition-all hover:shadow-md"
                >
                    <Link
                        href={`/course/${courseId}`}
                        className="block p-4 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                        <span className="font-medium">{courseId}</span>
                        <span className="text-sm text-gray-500 ml-2">({sqlId})</span>
                    </Link>
                </motion.li>
            ))}
        </motion.ul>
    );
}
