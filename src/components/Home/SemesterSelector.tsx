"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

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
        <div className="mb-8 relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
                <span>選擇學期</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">載入中...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">無法載入學期資料</div>
                        ) : (
                            <div className="py-2 px-1">
                                <div className="text-sm text-gray-600 px-3 py-2">選擇您要查看的學期</div>
                                {filteredSemesters.map((semester: string) => (
                                    <button
                                        key={semester}
                                        onClick={() => {
                                            onSelect(semester);
                                            setIsOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 hover:bg-indigo-50 rounded-md transition-colors ${selectedSemesters.includes(semester) ? "bg-indigo-100 text-indigo-700" : ""
                                            }`}
                                    >
                                        {semester} 學期
                                        {selectedSemesters.includes(semester) && (
                                            <span className="float-right text-indigo-600">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SemesterSelector;
