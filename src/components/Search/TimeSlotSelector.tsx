"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, X, Check } from "lucide-react";

interface TimeSlot {
    day: string;
    period: number;
}

interface TimeSlotSelectorProps {
    selectedSlots: TimeSlot[];
    onSlotsChange: (slots: TimeSlot[]) => void;
}

const timeSlots = [
    { period: 1, time: "06:10~07:00" },
    { period: 2, time: "07:10~08:00" },
    { period: 3, time: "08:10~09:00" },
    { period: 4, time: "09:10~10:00" },
    { period: 5, time: "10:10~11:00" },
    { period: 6, time: "11:10~12:00" },
    { period: 7, time: "12:10~13:00" },
    { period: 8, time: "13:10~14:00" },
    { period: 9, time: "14:10~15:00" },
    { period: 10, time: "15:10~16:00" },
    { period: 11, time: "16:10~17:00" },
    { period: 12, time: "17:10~18:00" },
    { period: 13, time: "18:10~19:00" },
    { period: 14, time: "19:10~20:00" },
    { period: 15, time: "20:10~21:00" },
    { period: 16, time: "21:10~22:00" },
];

const days = [
    { key: "一", name: "週一" },
    { key: "二", name: "週二" },
    { key: "三", name: "週三" },
    { key: "四", name: "週四" },
    { key: "五", name: "週五" },
    { key: "六", name: "週六" },
    { key: "日", name: "週日" }
];

export default function TimeSlotSelector({ selectedSlots, onSlotsChange }: TimeSlotSelectorProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartSlot, setDragStartSlot] = useState<TimeSlot | null>(null);
    const [isAddingMode, setIsAddingMode] = useState(true);
    const baseSelectionRef = useRef<TimeSlot[]>([]);
    const currentHoverRef = useRef<TimeSlot | null>(null);
    const didDragRef = useRef(false);

    // 檢查某個時間段是否被選中
    const isSlotSelected = (day: string, period: number): boolean => {
        return selectedSlots.some(slot => slot.day === day && slot.period === period);
    };

    // 取得 day 的索引
    const getDayIndex = (dayKey: string) => days.findIndex(d => d.key === dayKey);

    // 建立矩形範圍內的所有時段
    const getRectangleSlots = (start: TimeSlot, end: TimeSlot): TimeSlot[] => {
        const startDayIdx = getDayIndex(start.day);
        const endDayIdx = getDayIndex(end.day);
        const minDay = Math.min(startDayIdx, endDayIdx);
        const maxDay = Math.max(startDayIdx, endDayIdx);
        const minPeriod = Math.min(start.period, end.period);
        const maxPeriod = Math.max(start.period, end.period);

        const rect: TimeSlot[] = [];
        for (let d = minDay; d <= maxDay; d++) {
            for (let p = minPeriod; p <= maxPeriod; p++) {
                rect.push({ day: days[d].key, period: p });
            }
        }
        return rect;
    };

    // 套用拖曳預覽選取（類似試算表矩形選取）
    const applySelectionPreview = (end: TimeSlot) => {
        if (!dragStartSlot) return;
        const base = baseSelectionRef.current;
        const rect = getRectangleSlots(dragStartSlot, end);

        const rectKey = (s: TimeSlot) => `${s.day}-${s.period}`;
        const rectSet = new Set(rect.map(rectKey));

        if (isAddingMode) {
            // 新選取 = 基礎選取 ∪ 矩形
            const map = new Map<string, TimeSlot>();
            base.forEach(s => map.set(rectKey(s), s));
            rect.forEach(s => map.set(rectKey(s), s));
            onSlotsChange(Array.from(map.values()).sort((a, b) => {
                const da = getDayIndex(a.day) - getDayIndex(b.day);
                return da !== 0 ? da : a.period - b.period;
            }));
        } else {
            // 新選取 = 基礎選取 - 矩形
            const next = base.filter(s => !rectSet.has(rectKey(s)));
            onSlotsChange(next);
        }
    };

    // 處理滑鼠按下
    const handleMouseDown = (day: string, period: number) => {
        setIsDragging(true);
        const start = { day, period };
        setDragStartSlot(start);
        currentHoverRef.current = start;
        didDragRef.current = false;
        // 拖曳模式：若起點原本已選，則進入移除模式，反之新增模式
        setIsAddingMode(!isSlotSelected(day, period));
        // 記錄拖曳開始時的基礎選取狀態
        baseSelectionRef.current = selectedSlots;
        // 不在 mousedown 立即變更，等待拖曳或 click 結束時處理
    };

    // 處理滑鼠進入（拖曳時）
    const handleMouseEnter = (day: string, period: number) => {
        if (!isDragging || !dragStartSlot) return;
        const hover = { day, period };
        currentHoverRef.current = hover;
        if (hover.day !== dragStartSlot.day || hover.period !== dragStartSlot.period) {
            didDragRef.current = true;
        }
        applySelectionPreview(hover);
    };

    // 處理滑鼠放開
    const handleMouseUp = () => {
        // 若沒有實際拖曳，視為單擊切換
        if (isDragging && dragStartSlot && !didDragRef.current) {
            const { day, period } = dragStartSlot;
            const exists = isSlotSelected(day, period);
            if (exists) {
                onSlotsChange(selectedSlots.filter(s => !(s.day === day && s.period === period)));
            } else {
                onSlotsChange([...selectedSlots, { day, period }]);
            }
        }

        setIsDragging(false);
        setDragStartSlot(null);
        currentHoverRef.current = null;
        didDragRef.current = false;
    };

    // 清除所有選擇
    const clearAll = () => {
        onSlotsChange([]);
    };

    // 選擇整天
    const selectWholeDay = (day: string) => {
        const daySlots = timeSlots.map(slot => ({ day, period: slot.period }));
        const allSelected = daySlots.every(slot => isSlotSelected(slot.day, slot.period));

        if (allSelected) {
            // 取消選擇整天
            onSlotsChange(selectedSlots.filter(slot => slot.day !== day));
        } else {
            // 選擇整天
            const newSlots = [...selectedSlots];
            daySlots.forEach(slot => {
                if (!isSlotSelected(slot.day, slot.period)) {
                    newSlots.push(slot);
                }
            });
            onSlotsChange(newSlots);
        }
    };

    // 選擇整節（所有天的同一節次）
    const selectWholePeriod = (period: number) => {
        const periodSlots = days.map(day => ({ day: day.key, period }));
        const allSelected = periodSlots.every(slot => isSlotSelected(slot.day, slot.period));

        if (allSelected) {
            // 取消選擇整節
            onSlotsChange(selectedSlots.filter(slot => slot.period !== period));
        } else {
            // 選擇整節
            const newSlots = [...selectedSlots];
            periodSlots.forEach(slot => {
                if (!isSlotSelected(slot.day, slot.period)) {
                    newSlots.push(slot);
                }
            });
            onSlotsChange(newSlots);
        }
    };

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* 標題列 */}
            <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-semibold text-gray-900">選擇可用時間段</h3>
                        {selectedSlots.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                                已選 {selectedSlots.length} 個時段
                            </span>
                        )}
                    </div>
                    {selectedSlots.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                            <span>清除</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 提示訊息 */}
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700">
                    💡 點擊或拖曳選擇時間段，點擊週次/時段標題可快速選擇整列/整欄
                </p>
            </div>

            {/* 時間表 */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse select-none">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 w-20">
                                時段
                            </th>
                            {days.map(day => (
                                <th
                                    key={day.key}
                                    className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[80px] cursor-pointer hover:bg-indigo-50 transition-colors group"
                                    onClick={() => selectWholeDay(day.key)}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>{day.name}</span>
                                        {timeSlots.every(slot => isSlotSelected(day.key, slot.period)) && (
                                            <Check className="w-3 h-3 text-indigo-600" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(slot => (
                            <tr key={slot.period} className="hover:bg-gray-50/50">
                                <td
                                    className="border border-gray-200 px-2 py-1 bg-gray-50 text-center cursor-pointer hover:bg-indigo-50 transition-colors group"
                                    onClick={() => selectWholePeriod(slot.period)}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <div>
                                            <div className="font-medium text-xs">{slot.period}</div>
                                            <div className="text-[10px] text-gray-500 leading-tight">{slot.time}</div>
                                        </div>
                                        {days.every(day => isSlotSelected(day.key, slot.period)) && (
                                            <Check className="w-3 h-3 text-indigo-600" />
                                        )}
                                    </div>
                                </td>
                                {days.map(day => {
                                    const isSelected = isSlotSelected(day.key, slot.period);
                                    return (
                                        <td
                                            key={day.key}
                                            className={`border border-gray-200 p-1 text-center cursor-cell transition-all duration-150 ${isSelected
                                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                                : 'bg-white hover:bg-indigo-50'
                                                }`}
                                            onMouseDown={() => handleMouseDown(day.key, slot.period)}
                                            onMouseEnter={() => handleMouseEnter(day.key, slot.period)}
                                            style={{
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                            }}
                                        >
                                            <motion.div
                                                className="w-full h-8 flex items-center justify-center rounded"
                                                animate={{
                                                    scale: isSelected ? 1 : 0.95,
                                                }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Check className="w-4 h-4 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 快速選擇按鈕 */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-gray-600">
                        快速選擇：
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const morningSlots: TimeSlot[] = [];
                                days.forEach(day => {
                                    for (let period = 3; period <= 6; period++) {
                                        morningSlots.push({ day: day.key, period });
                                    }
                                });
                                onSlotsChange(morningSlots);
                            }}
                            className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            上午 (3-6節)
                        </button>
                        <button
                            onClick={() => {
                                const afternoonSlots: TimeSlot[] = [];
                                days.forEach(day => {
                                    for (let period = 8; period <= 11; period++) {
                                        afternoonSlots.push({ day: day.key, period });
                                    }
                                });
                                onSlotsChange(afternoonSlots);
                            }}
                            className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            下午 (8-11節)
                        </button>
                        <button
                            onClick={() => {
                                const eveningSlots: TimeSlot[] = [];
                                days.forEach(day => {
                                    for (let period = 13; period <= 16; period++) {
                                        eveningSlots.push({ day: day.key, period });
                                    }
                                });
                                onSlotsChange(eveningSlots);
                            }}
                            className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            晚上 (13-16節)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
