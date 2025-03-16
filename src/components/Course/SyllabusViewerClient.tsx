"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, ArrowLeft, Book, Download } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const PDFViewer = dynamic(
    () => import("./PDFViewer"),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-16 px-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">載入 PDF 瀏覽器中...</p>
            </div>
        )
    }
);

interface SyllabusViewerClientProps {
    course: {
        course_name: string;
        course_id: string;
        teaching_plan_link: string;
        sql_id: string;
    };
    semester: string;
    id: string;
}

export default function SyllabusViewerClient({ course, semester, id }: SyllabusViewerClientProps) {
    const router = useRouter();
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);

    const handleClose = () => {
        router.push(`/course/${semester}/${id}`);
    };

    const syllabus_proxy_url = `https://ndhu-course-syllabus-proxy.yccccccccccc.workers.dev/?sqlid=${course.sql_id}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
            <motion.div
                className="sticky top-0 z-10 bg-white border-b shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
                    <motion.div
                        className="flex items-center"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.button
                            onClick={handleClose}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 246, 255, 1)" }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="返回課程頁面"
                        >
                            <ArrowLeft className="h-5 w-5 text-blue-600" />
                        </motion.button>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Book className="h-5 w-5 mr-2 text-blue-600" />
                                {course.course_name}
                            </h2>
                            <p className="text-sm text-gray-500">教學計劃表 • {course.course_id}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                    >
                        <motion.a
                            href={course.teaching_plan_link}
                            target="_blank"
                            download={`${course.course_name}-教學計劃表.pdf`}
                            className="p-2 hover:bg-blue-50 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setShowDownloadTooltip(true)}
                            onMouseLeave={() => setShowDownloadTooltip(false)}
                        >
                            <Download className="h-5 w-5 text-blue-600" />
                        </motion.a>

                        {showDownloadTooltip && (
                            <motion.div
                                className="absolute right-0 top-full mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                下載 PDF
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                className="max-w-4xl mx-auto p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <PDFViewer url={syllabus_proxy_url} teaching_plan_link={course.teaching_plan_link} />
            </motion.div>

            <motion.div
                className="fixed bottom-6 right-6 z-20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
            >
                <motion.button
                    onClick={handleClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X className="h-5 w-5" />
                </motion.button>
            </motion.div>
        </div>
    );
}
