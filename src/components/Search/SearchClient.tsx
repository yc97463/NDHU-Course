"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter, BookOpen, Users, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ScheduleStorage } from '@/utils/scheduleStorage';
import TimeSlotSelector from './TimeSlotSelector';

interface TimeSlot {
    day: string;
    period: number;
}

interface CourseInfo {
    id: string;
    name: string;
    college?: string;
    offering_department?: string;
    teacher?: string;
    credits?: string;
    classroom?: string;
    class_time?: Array<{
        day: string;
        period: string;
    }>;
}

interface SearchClientProps {
    courses: CourseInfo[];
    semester: string;
}

export default function SearchClient({ courses, semester }: SearchClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<string>('all');
    const [selectedCredits, setSelectedCredits] = useState<string>('all');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const didOpenFromURL = useRef(false);
    const hasInitFromURL = useRef(false);
    const isApplyingFromURL = useRef(false);
    const urlApplyTimerRef = useRef<number | null>(null);
    const lastAppliedQueryRef = useRef<string | null>(null);

    // 分頁狀態
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // 提取學院列表
    const colleges = useMemo(() => {
        const collegeSet = new Set<string>();
        courses.forEach(course => {
            if (course.college) {
                const collegeName = course.college.split('::')[0];
                collegeSet.add(collegeName);
            }
        });
        return ['all', ...Array.from(collegeSet).sort()];
    }, [courses]);

    // 提取學分選項
    const creditOptions = useMemo(() => {
        const creditSet = new Set<string>();
        courses.forEach(course => {
            if (course.credits) {
                const credit = course.credits.split('/')[0];
                creditSet.add(credit);
            }
        });
        return ['all', ...Array.from(creditSet).sort((a, b) => parseFloat(a) - parseFloat(b))];
    }, [courses]);

    // 時段編碼/解碼，反映到 URL
    const dayOrder = useMemo<Record<string, number>>(() => ({ '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 }), []);
    const encodeTimeSlots = useCallback((slots: TimeSlot[]): string => {
        const sorted = [...slots].sort((a, b) => (dayOrder[a.day] - dayOrder[b.day]) || (a.period - b.period));
        return sorted.map(s => `${s.day}${s.period}`).join(',');
    }, [dayOrder]);
    const decodeTimeSlots = useCallback((value: string): TimeSlot[] => {
        if (!value) return [];
        const parts = value.split(',').filter(Boolean);
        const parsed: TimeSlot[] = [];
        for (const token of parts) {
            const day = token.charAt(0);
            const period = parseInt(token.slice(1), 10);
            if (dayOrder[day] && Number.isFinite(period)) {
                parsed.push({ day, period });
            }
        }
        return parsed;
    }, [dayOrder]);
    const equalTimeSlots = useCallback((a: TimeSlot[], b: TimeSlot[]) => encodeTimeSlots(a) === encodeTimeSlots(b), [encodeTimeSlots]);

    // 搜尋和篩選邏輯
    const filteredCourses = useMemo(() => {
        let result = courses;

        // 文字搜尋
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(course => {
                const searchableText = [
                    course.id,
                    course.name,
                    course.teacher,
                    course.offering_department,
                    course.college
                ].filter(Boolean).join(' ').toLowerCase();

                return searchableText.includes(query);
            });
        }

        // 學院篩選
        if (selectedCollege !== 'all') {
            result = result.filter(course => {
                if (!course.college) return false;
                const collegeName = course.college.split('::')[0];
                return collegeName === selectedCollege;
            });
        }

        // 學分篩選
        if (selectedCredits !== 'all') {
            result = result.filter(course => {
                if (!course.credits) return false;
                const credit = course.credits.split('/')[0];
                return credit === selectedCredits;
            });
        }

        // 時間段篩選
        if (selectedTimeSlots.length > 0) {
            result = result.filter(course => {
                if (!course.class_time || course.class_time.length === 0) return false;

                // 檢查課程是否有任一時間段符合選定的時間段
                return course.class_time.some(classTime => {
                    return selectedTimeSlots.some(slot =>
                        slot.day === classTime.day &&
                        slot.period === parseInt(classTime.period)
                    );
                });
            });
        }

        return result;
    }, [courses, searchQuery, selectedCollege, selectedCredits, selectedTimeSlots]);

    // 清除所有篩選
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCollege('all');
        setSelectedCredits('all');
        setSelectedTimeSlots([]);
        setCurrentPage(1); // 重置到第一頁
    }, []);

    // 檢查是否有任何篩選條件
    const hasActiveFilters = searchQuery.trim() !== '' || selectedCollege !== 'all' || selectedCredits !== 'all' || selectedTimeSlots.length > 0;

    // 使用 ref 來追蹤上一次的篩選條件，避免不必要的重置
    const prevFiltersRef = useRef({
        searchQuery,
        selectedCollege,
        selectedCredits,
        timeSlotsLength: selectedTimeSlots.length
    });

    // 當篩選條件改變時，重置到第一頁
    useEffect(() => {
        const prev = prevFiltersRef.current;
        const hasChanged =
            prev.searchQuery !== searchQuery ||
            prev.selectedCollege !== selectedCollege ||
            prev.selectedCredits !== selectedCredits ||
            prev.timeSlotsLength !== selectedTimeSlots.length;

        if (hasChanged) {
            setCurrentPage(1);
            prevFiltersRef.current = {
                searchQuery,
                selectedCollege,
                selectedCredits,
                timeSlotsLength: selectedTimeSlots.length
            };
        }
    }, [searchQuery, selectedCollege, selectedCredits, selectedTimeSlots.length]);

    // 從 URL 初始化/同步狀態（支援分享連結與返回/前進導航）
    useEffect(() => {
        // 開始套用 URL 狀態，暫停寫回 URL
        isApplyingFromURL.current = true;

        const q = searchParams.get('q') ?? '';
        const college = searchParams.get('college') ?? 'all';
        const credits = searchParams.get('credits') ?? 'all';
        const ts = decodeTimeSlots(searchParams.get('ts') ?? '');
        const page = parseInt(searchParams.get('page') ?? '1', 10);
        const size = parseInt(searchParams.get('size') ?? '20', 10);

        if (q !== searchQuery) setSearchQuery(q);
        if (college !== selectedCollege) setSelectedCollege(college);
        if (credits !== selectedCredits) setSelectedCredits(credits);
        if (!equalTimeSlots(ts, selectedTimeSlots)) setSelectedTimeSlots(ts);
        if (Number.isFinite(page) && page > 0 && page !== currentPage) setCurrentPage(page);
        if (Number.isFinite(size) && size > 0 && size !== itemsPerPage) setItemsPerPage(size);

        // 初次載入若 URL 已帶條件，展開篩選區塊以利使用者查看與調整
        const hasUrlFilters = (q && q.length > 0) || college !== 'all' || credits !== 'all' || ts.length > 0;
        if (hasUrlFilters && !didOpenFromURL.current) {
            setShowFilters(true);
            didOpenFromURL.current = true;
        }

        // 記錄目前實際的查詢字串，避免循環
        lastAppliedQueryRef.current = searchParams.toString();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // 當本地狀態與 URL 查詢相符時，宣告初始化完成並允許寫回 URL
    useEffect(() => {
        if (hasInitFromURL.current && !isApplyingFromURL.current) return;
        const params = new URLSearchParams();
        const q = searchQuery.trim();
        if (q) params.set('q', q);
        if (selectedCollege !== 'all') params.set('college', selectedCollege);
        if (selectedCredits !== 'all') params.set('credits', selectedCredits);
        if (selectedTimeSlots.length > 0) params.set('ts', encodeTimeSlots(selectedTimeSlots));
        if (currentPage > 1) params.set('page', String(currentPage));
        if (itemsPerPage !== 20) params.set('size', String(itemsPerPage));
        const nextQs = params.toString();
        const currQs = lastAppliedQueryRef.current ?? searchParams.toString();
        if (nextQs === currQs) {
            hasInitFromURL.current = true;
            isApplyingFromURL.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedCollege, selectedCredits, selectedTimeSlots, currentPage, itemsPerPage, encodeTimeSlots]);

    // 將狀態同步到 URL（僅在有差異時更新，避免循環）
    useEffect(() => {
        // 若正在套用 URL 狀態，或尚未完成初始化，避免用預設狀態覆蓋 URL
        if (isApplyingFromURL.current || !hasInitFromURL.current) return;
        const params = new URLSearchParams();
        const q = searchQuery.trim();
        if (q) params.set('q', q);
        if (selectedCollege !== 'all') params.set('college', selectedCollege);
        if (selectedCredits !== 'all') params.set('credits', selectedCredits);
        if (selectedTimeSlots.length > 0) params.set('ts', encodeTimeSlots(selectedTimeSlots));
        if (currentPage > 1) params.set('page', String(currentPage));
        if (itemsPerPage !== 20) params.set('size', String(itemsPerPage));

        const nextQs = params.toString();
        const currQs = lastAppliedQueryRef.current ?? searchParams.toString();
        if (nextQs !== currQs) {
            const nextUrl = nextQs ? `${pathname}?${nextQs}` : pathname;
            lastAppliedQueryRef.current = nextQs;
            router.replace(nextUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedCollege, selectedCredits, selectedTimeSlots, currentPage, itemsPerPage, pathname]);

    // 清理計時器
    useEffect(() => {
        const timer = urlApplyTimerRef.current;
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, []);

    // 計算分頁資料
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // 生成頁碼陣列
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7; // 最多顯示的頁碼數量

        if (totalPages <= maxVisible) {
            // 總頁數較少，顯示所有頁碼
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 總頁數較多，智能顯示
            if (currentPage <= 4) {
                // 當前頁在前面
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // 當前頁在後面
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // 當前頁在中間
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="space-y-6">
            {/* 搜尋列 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                    {/* 主要搜尋輸入框 */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋課程名稱、課程代碼、教師姓名..."
                            className="block w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* 篩選按鈕 */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${showFilters || hasActiveFilters
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>篩選條件</span>
                            {hasActiveFilters && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                                    {(selectedCollege !== 'all' ? 1 : 0) + (selectedCredits !== 'all' ? 1 : 0) + (selectedTimeSlots.length > 0 ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                            >
                                清除所有篩選
                            </button>
                        )}
                    </div>

                    {/* 展開的篩選選項 */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 border-t border-gray-200 space-y-4">
                                    {/* 學院篩選 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            學院
                                        </label>
                                        <select
                                            value={selectedCollege}
                                            onChange={(e) => setSelectedCollege(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="all">全部學院</option>
                                            {colleges.filter(c => c !== 'all').map(college => (
                                                <option key={college} value={college}>
                                                    {college}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 學分篩選 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            學分
                                        </label>
                                        <select
                                            value={selectedCredits}
                                            onChange={(e) => setSelectedCredits(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="all">全部學分</option>
                                            {creditOptions.filter(c => c !== 'all').map(credit => (
                                                <option key={credit} value={credit}>
                                                    {credit} 學分
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 時間段篩選 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            可用時間段
                                            {selectedTimeSlots.length > 0 && (
                                                <span className="ml-2 text-xs text-indigo-600">
                                                    (已選擇 {selectedTimeSlots.length} 個時段)
                                                </span>
                                            )}
                                        </label>
                                        <TimeSlotSelector
                                            selectedSlots={selectedTimeSlots}
                                            onSlotsChange={setSelectedTimeSlots}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 搜尋結果統計與分頁設定 */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                    找到 <span className="font-medium text-indigo-600">{filteredCourses.length}</span> 門課程
                    {filteredCourses.length !== courses.length && (
                        <span className="text-gray-500"> / 共 {courses.length} 門</span>
                    )}
                    {filteredCourses.length > 0 && (
                        <span className="text-gray-500">
                            {' '}· 顯示第 {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} 門
                        </span>
                    )}
                </div>

                {/* 每頁顯示數量選擇 */}
                {filteredCourses.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                            每頁顯示：
                        </label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                )}
            </div>

            {/* 搜尋結果列表 */}
            {filteredCourses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {paginatedCourses.map((course, index) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                semester={semester}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* 分頁控制 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-8">
                            {/* 上一頁按鈕 */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                上一頁
                            </button>

                            {/* 頁碼按鈕 */}
                            <div className="flex items-center space-x-1">
                                {getPageNumbers().map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }

                                    const pageNum = page as number;
                                    const isActive = pageNum === currentPage;

                                    return (
                                        <motion.button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            whileHover={{ scale: isActive ? 1 : 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* 下一頁按鈕 */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                下一頁
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到符合的課程</h3>
                    <p className="text-gray-500 mb-4">
                        {hasActiveFilters ? '請嘗試調整搜尋條件或篩選條件' : '請輸入關鍵字開始搜尋'}
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                            清除所有篩選
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// 課程卡片組件
function CourseCard({ course, semester, index }: { course: CourseInfo; semester: string; index: number }) {
    const [isInSchedule, setIsInSchedule] = useState(false);

    useEffect(() => {
        setIsInSchedule(ScheduleStorage.isCourseInSchedule(semester, course.id));
    }, [semester, course.id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
        >
            <Link href={`/course/${semester}/${course.id}`} target='_blank'>
                <motion.div
                    className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            {/* 課程標題 */}
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                                        {course.id}
                                    </span>
                                </div>
                                {isInSchedule && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                                        已加入課表
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-3">
                                {course.name}
                            </h3>

                            {/* 課程詳細資訊 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {course.teacher && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Users className="w-4 h-4 flex-shrink-0" />
                                        <span>教師：{course.teacher.replace(/\//g, '').trim()}</span>
                                    </div>
                                )}

                                {course.credits && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                                        <span>學分：{course.credits.split('/')[0]}</span>
                                    </div>
                                )}

                                {course.classroom && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>教室：{course.classroom}</span>
                                    </div>
                                )}

                                {course.class_time && course.class_time.length > 0 && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            時間：
                                            {course.class_time.map(t => `週${t.day} 第${t.period}節`).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 標籤 */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {course.college && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                        {course.college.split('::')[0]}
                                    </span>
                                )}
                                {course.offering_department && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                        {course.offering_department.split('::')[0]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 箭頭圖示 */}
                        <motion.div
                            className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ x: 4 }}
                        >
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 text-lg">→</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
