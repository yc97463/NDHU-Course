"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar } from "lucide-react";

interface SemesterScheduleSelectorProps {
    availableSemesters: string[];
    selectedSemester: string;
    onSemesterChange: (semester: string) => void;
}

export default function SemesterScheduleSelector({
    availableSemesters,
    selectedSemester,
    onSemesterChange
}: SemesterScheduleSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (availableSemesters.length === 0) {
        return (
            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-500">尚未加入任何課程</span>
            </div>
        );
    }

    // 排序學期（最新的在前面）
    const sortedSemesters = [...availableSemesters].sort((a, b) => {
        const [yearA, termA] = a.split("-").map(Number);
        const [yearB, termB] = b.split("-").map(Number);
        return yearB === yearA ? termB - termA : yearB - yearA;
    });

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                            {selectedSemester ? `${selectedSemester} 學期` : "選擇學期"}
                        </div>
                        <div className="text-xs text-gray-500">
                            {availableSemesters.length} 個學期有課程
                        </div>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        <div className="py-1">
                            {sortedSemesters.map((semester) => (
                                <motion.button
                                    key={semester}
                                    onClick={() => {
                                        onSemesterChange(semester);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${selectedSemester === semester
                                            ? "bg-blue-100 text-blue-700 font-medium"
                                            : "text-gray-700"
                                        }`}
                                    whileHover={{ backgroundColor: selectedSemester === semester ? "#dbeafe" : "#f8fafc" }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{semester} 學期</span>
                                        {selectedSemester === semester && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-blue-600 rounded-full"
                                            />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 點擊外部關閉下拉選單 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
} 