"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Sparkles } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/",
            label: "瀏覽課表",
            icon: BookOpen,
            active: pathname === "/"
        },
        {
            href: "/schedule",
            label: "我的課表",
            icon: Calendar,
            active: pathname === "/schedule"
        }
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-3"
                        >
                            <div className="relative">
                                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900">NDHU Course</span>
                                <span className="text-xs text-gray-500 -mt-1">東華查課拉</span>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${item.active
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className={`w-4 h-4 ${item.active ? 'text-indigo-600' : ''}`} />
                                        <span className="text-sm font-medium">{item.label}</span>

                                        {item.active && (
                                            <motion.div
                                                className="absolute inset-0 bg-indigo-100/50 rounded-xl -z-10"
                                                layoutId="activeNavBg"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
} 