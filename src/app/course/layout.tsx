'use client';

// 引入必要的客戶端動畫支持
import { AnimatePresence } from 'framer-motion';

export default function CourseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AnimatePresence mode="wait">
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {children}
            </div>
        </AnimatePresence>
    );
}
