"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, ArrowLeft, Book, Download, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const PDFViewer = dynamic(
    () => import("./PDFViewer"),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-16 px-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
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
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleClose = () => {
        router.push(`/course/${semester}/${id}`);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const syllabus_proxy_url = `https://ndhu-course-syllabus-proxy.yccccccccccc.workers.dev/?sqlid=${course.sql_id}`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 頂部導航欄 */}
            <motion.div
                className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
                    <motion.div
                        className="flex items-center"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.button
                            onClick={handleClose}
                            className="mr-4 p-2 hover:bg-indigo-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="返回課程頁面"
                        >
                            <ArrowLeft className="h-5 w-5 text-indigo-600" />
                        </motion.button>

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Book className="h-5 w-5 mr-2 text-indigo-600" />
                                {course.course_name}
                            </h2>
                            <p className="text-sm text-gray-600">教學計劃表 • {course.course_id}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative flex items-center space-x-2"
                    >
                        <div className="relative">
                            <motion.button
                                onClick={handleCopyLink}
                                className="p-2 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseEnter={() => setShowCopyTooltip(true)}
                                onMouseLeave={() => setShowCopyTooltip(false)}
                            >
                                {copied ?
                                    <Check className="h-5 w-5 text-emerald-600" /> :
                                    <Copy className="h-5 w-5 text-indigo-600" />
                                }
                            </motion.button>

                            {showCopyTooltip && !copied && (
                                <motion.div
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    複製連結
                                </motion.div>
                            )}

                            {copied && (
                                <motion.div
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-emerald-600 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    已複製！
                                </motion.div>
                            )}
                        </div>

                        <div className="relative">
                            <motion.a
                                href={course.teaching_plan_link}
                                target="_blank"
                                download={`${course.course_name}-教學計劃表.pdf`}
                                className="p-2 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseEnter={() => setShowDownloadTooltip(true)}
                                onMouseLeave={() => setShowDownloadTooltip(false)}
                            >
                                <Download className="h-5 w-5 text-indigo-600" />
                            </motion.a>

                            {showDownloadTooltip && (
                                <motion.div
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    下載 PDF
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* PDF 預覽區域 */}
            <motion.div
                className="max-w-6xl mx-auto p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <PDFViewer url={syllabus_proxy_url} teaching_plan_link={course.teaching_plan_link} />
                </div>
            </motion.div>

            {/* 浮動操作按鈕 */}
            <motion.div
                className="fixed bottom-6 right-6 z-20 flex flex-col gap-3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
            >
                <motion.a
                    href={course.teaching_plan_link}
                    target="_blank"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg flex items-center cursor-pointer transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Download className="h-5 w-5" />
                </motion.a>

                <motion.button
                    onClick={handleCopyLink}
                    className={`${copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                        } text-white rounded-full p-3 shadow-lg flex items-center cursor-pointer transition-colors`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </motion.button>

                <motion.button
                    onClick={handleClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg flex items-center cursor-pointer transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X className="h-5 w-5" />
                </motion.button>
            </motion.div>
        </div>
    );
}
