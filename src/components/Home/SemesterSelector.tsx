"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { ChevronDown, Calendar, Check } from "lucide-react";

// Define the props interface
interface SemesterSelectorProps {
    onSelect: (semester: string) => void;
    selectedSemesters: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Make sure to export as default
const SemesterSelector: React.FC<SemesterSelectorProps> = ({ onSelect, selectedSemesters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: semesters, error, isLoading } = useSWR(
        "https://yc97463.github.io/ndhu-course-crawler/semester.json",
        fetcher
    );

    // Filter semesters based on criteria
    const filteredSemesters = semesters ? semesters
        .filter((semester: string) => {
            const [year, term] = semester.split("-");
            return parseInt(term) <= 2 && parseInt(year) >= 105;
        })
        .sort((a: string, b: string) => {
            // Sort by year and term in descending order
            const [yearA, termA] = a.split("-").map(Number);
            const [yearB, termB] = b.split("-").map(Number);
            return yearB === yearA ? termB - termA : yearB - yearA;
        }) : [];

    return (
        <div className="max-w-md mx-auto">
            <div className="relative">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">
                                {selectedSemesters.length === 0
                                    ? "選擇學期"
                                    : `已選擇 ${selectedSemesters.length} 個學期`}
                            </div>
                            <div className="text-xs text-gray-500">
                                {selectedSemesters.length > 0 && (
                                    selectedSemesters.slice(0, 2).join(", ") +
                                    (selectedSemesters.length > 2 ? ` 等 ${selectedSemesters.length} 個` : "")
                                )}
                            </div>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
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
                            className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
                        >
                            {isLoading ? (
                                <div className="p-4 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">載入中...</p>
                                </div>
                            ) : error ? (
                                <div className="p-4 text-center">
                                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-red-600">無法載入學期資料</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        可選學期
                                    </div>
                                    {filteredSemesters.map((semester: string) => {
                                        const isSelected = selectedSemesters.includes(semester);
                                        return (
                                            <motion.button
                                                key={semester}
                                                onClick={() => {
                                                    onSelect(semester);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                                                    }`}
                                                whileHover={{ backgroundColor: isSelected ? "#e0e7ff" : "#f9fafb" }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-indigo-600" : "bg-gray-300"
                                                        }`} />
                                                    <span className="font-medium">{semester} 學期</span>
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="flex-shrink-0"
                                                    >
                                                        <Check className="w-4 h-4 text-indigo-600" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
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
        </div>
    );
};

export default SemesterSelector;
