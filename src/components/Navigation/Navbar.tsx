"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Calendar, BookOpen } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/",
            label: "課程列表",
            icon: BookOpen,
            active: pathname === "/"
        },
        {
            href: "/schedule",
            label: "我的時刻表",
            icon: Calendar,
            active: pathname === "/schedule"
        }
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">NDHU 課程</span>
                        </motion.div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${item.active
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>

                                        {item.active && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                                layoutId="activeTab"
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