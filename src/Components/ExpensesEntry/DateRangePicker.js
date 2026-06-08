import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    parseISO,
    setMonth,
    setYear,
} from 'date-fns';

const DATE_RANGE_PICKER_PANEL_WIDTH_PX = 252;
const DATE_RANGE_PICKER_PANEL_PADDING_PX = 6;
const DATE_RANGE_PICKER_DAY_CELL_SIZE_PX = 26;
const DATE_RANGE_PICKER_MONTH_YEAR_GRID_WIDTH_PX = 200;
const DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX = 26;

const DateRangePicker = ({ isOpen, onClose, startDate, endDate, onApply, variant = "modal", controlHeightPx }) => {
    const [viewDate, setViewDate] = useState(() => startDate ? parseISO(startDate) : new Date());
    const [tempFrom, setTempFrom] = useState(startDate ? parseISO(startDate) : null);
    const [tempTo, setTempTo] = useState(endDate ? parseISO(endDate) : null);
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const containerRef = useRef(null);
    const panelRef = useRef(null);
    const lastMonthWheelAt = useRef(0);
    const lastYearWheelAt = useRef(0);
    const singleClickTimerRef = useRef(null);
    const tempFromRef = useRef(tempFrom);
    const tempToRef = useRef(tempTo);
    const today = useMemo(() => new Date(), []);

    useEffect(() => {
        tempFromRef.current = tempFrom;
    }, [tempFrom]);

    useEffect(() => {
        tempToRef.current = tempTo;
    }, [tempTo]);

    useEffect(() => {
        if (isOpen) {
            const sd = startDate && startDate.trim() ? parseISO(startDate) : null;
            const ed = endDate && endDate.trim() ? parseISO(endDate) : null;
            setTempFrom(sd);
            setTempTo(ed);
            setViewDate(sd || ed || new Date());
            setShowMonthYearPicker(false);
        }
        return () => {
            if (singleClickTimerRef.current) {
                clearTimeout(singleClickTimerRef.current);
                singleClickTimerRef.current = null;
            }
        };
    }, [isOpen, startDate, endDate]);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const weeks = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            weekDays.push(day);
            day = addDays(day, 1);
        }
        weeks.push(weekDays);
    }

    const applySingleDate = (d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        onApply(dateStr, dateStr);
        onClose();
    };

    const handleDateClick = (d) => {
        if (singleClickTimerRef.current) {
            clearTimeout(singleClickTimerRef.current);
        }
        singleClickTimerRef.current = setTimeout(() => {
            singleClickTimerRef.current = null;
            const from = tempFromRef.current;
            const to = tempToRef.current;
            if (!from || to) {
                setTempFrom(d);
                setTempTo(null);
            } else if (d < from) {
                setTempTo(from);
                setTempFrom(d);
            } else {
                setTempTo(d);
            }
        }, 250);
    };

    const handleDateDoubleClick = (d) => {
        if (singleClickTimerRef.current) {
            clearTimeout(singleClickTimerRef.current);
            singleClickTimerRef.current = null;
        }
        applySingleDate(d);
    };

    const isInRange = (d) => {
        if (!tempFrom || !tempTo) return false;
        return isWithinInterval(d, { start: tempFrom, end: tempTo });
    };

    const isSelected = (d) => {
        return (tempFrom && isSameDay(d, tempFrom)) || (tempTo && isSameDay(d, tempTo));
    };

    const handleClear = () => {
        setTempFrom(null);
        setTempTo(null);
    };

    const handleDone = () => {
        const fromStr = tempFrom ? format(tempFrom, 'yyyy-MM-dd') : '';
        const toStr = tempTo ? format(tempTo, 'yyyy-MM-dd') : '';
        onApply(fromStr, toStr);
        onClose();
    };

    // In dropdown mode: close when clicking outside the picker.
    // (Behaves like native date picker popover, without a full-screen overlay.)
    useEffect(() => {
        if (!isOpen || variant !== "dropdown") return;
        const onMouseDown = (e) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) {
                onClose();
            }
        };
        window.addEventListener("mousedown", onMouseDown);
        return () => window.removeEventListener("mousedown", onMouseDown);
    }, [isOpen, variant, onClose]);

    // Prevent background (table/page) scroll while using wheel inside popup.
    // Use a non-passive CAPTURE listener so preventDefault reliably blocks scroll.
    useEffect(() => {
        if (!isOpen) return;
        const onWheel = (e) => {
            const el = panelRef.current;
            if (!el) return;
            if (el.contains(e.target)) {
                e.preventDefault();
            }
        };
        window.addEventListener("wheel", onWheel, { passive: false, capture: true });
        return () => window.removeEventListener("wheel", onWheel, { capture: true });
    }, [isOpen]);

    if (!isOpen) return null;

    const months = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMM"));

    const Wrapper = ({ children }) => {
        if (variant === "dropdown") {
            return (
                <div
                    className={`absolute left-0 z-[99999] ${controlHeightPx ? '' : 'top-full mt-2'}`}
                    style={{
                        ...(controlHeightPx ? { top: `${controlHeightPx + 8}px` } : {}),
                        width: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                        minWidth: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                        maxWidth: 'none',
                    }}
                    ref={containerRef}
                >
                    {children}
                </div>
            );
        }
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
                <div ref={containerRef}>{children}</div>
            </div>
        );
    };

    return (
        <Wrapper>
            <div
                ref={panelRef}
                className="bg-white rounded-lg shadow-xl border border-gray-200 box-border"
                style={{
                    width: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                    minWidth: DATE_RANGE_PICKER_PANEL_WIDTH_PX,
                    maxWidth: 'none',
                    padding: DATE_RANGE_PICKER_PANEL_PADDING_PX,
                    boxSizing: 'border-box',
                }}
            >
                {/* Header: Month/Year with arrows */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    {showMonthYearPicker ? (
                        <div style={{ width: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX }} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setViewDate(subMonths(viewDate, 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-medium"
                            style={{
                                width: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
                                height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
                            }}
                            aria-label="Previous month"
                        >
                            &lt;
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowMonthYearPicker((v) => !v)}
                        className="px-3 rounded border border-gray-300 bg-gray-100 text-sm font-medium text-gray-800 hover:bg-gray-200 inline-flex items-center gap-2"
                        style={{ height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX }}
                        aria-label="Choose month and year"
                    >
                        {format(viewDate, 'MMMM yyyy')}
                        <span className="text-xs text-gray-700">{showMonthYearPicker ? "▴" : "▾"}</span>
                    </button>
                    {showMonthYearPicker ? (
                        <div style={{ width: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX }} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setViewDate(addMonths(viewDate, 1))}
                            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-medium"
                            style={{
                                width: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
                                height: DATE_RANGE_PICKER_NAV_BUTTON_SIZE_PX,
                            }}
                            aria-label="Next month"
                        >
                            &gt;
                        </button>
                    )}
                </div>

                {showMonthYearPicker ? (
                    <div className="py-1">
                        <div className="flex justify-center">
                            <div
                                className="grid grid-cols-2 gap-4"
                                style={{ width: DATE_RANGE_PICKER_MONTH_YEAR_GRID_WIDTH_PX }}
                            >
                                {/* Month wheel */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-gray-900"
                                        onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                                        aria-label="Previous month"
                                    >
                                        ^
                                    </button>
                                    <div
                                        className="w-full mt-1"
                                        onWheel={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastMonthWheelAt.current < 120) return;
                                            lastMonthWheelAt.current = now;
                                            const dir = e.deltaY > 0 ? 1 : -1;
                                            setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
                                        }}
                                    >
                                        {[-2, -1, 0, 1, 2].map((offset) => {
                                            const idx = (viewDate.getMonth() + offset + 12) % 12;
                                            const isActive = offset === 0;
                                            return (
                                                <button
                                                    key={`${idx}-${offset}`}
                                                    type="button"
                                                    onClick={() => setViewDate(setMonth(viewDate, idx))}
                                                    className={[
                                                        "w-full text-center px-2 py-1 rounded text-sm",
                                                        isActive ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-50",
                                                    ].join(" ")}
                                                >
                                                    {months[idx]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-gray-900 mt-1"
                                        onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                                        aria-label="Next month"
                                    >
                                        v
                                    </button>
                                </div>

                                {/* Year wheel */}
                                <div className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-gray-900"
                                        onClick={() => setViewDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
                                        aria-label="Previous year"
                                    >
                                        ^
                                    </button>
                                    <div
                                        className="w-full mt-1"
                                        onWheel={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastYearWheelAt.current < 120) return;
                                            lastYearWheelAt.current = now;
                                            const dir = e.deltaY > 0 ? 1 : -1;
                                            setViewDate((d) => new Date(d.getFullYear() + dir, d.getMonth(), 1));
                                        }}
                                    >
                                        {[-2, -1, 0, 1, 2].map((offset) => {
                                            const y = viewDate.getFullYear() + offset;
                                            const isActive = offset === 0;
                                            return (
                                                <button
                                                    key={y}
                                                    type="button"
                                                    onClick={() => setViewDate(setYear(viewDate, y))}
                                                    className={[
                                                        "w-full text-center px-2 py-1 rounded text-sm",
                                                        isActive ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-50",
                                                    ].join(" ")}
                                                >
                                                    {y}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-gray-600 hover:text-gray-900 mt-1"
                                        onClick={() => setViewDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
                                        aria-label="Next year"
                                    >
                                        v
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
                                <div
                                    key={d}
                                    className={`text-center text-[11px] font-medium py-0.5 ${idx === 0 || idx === 6 ? "text-red-500" : "text-gray-500"}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {weeks.flatMap((week) =>
                                week.map((d) => {
                                    const inMonth = isSameMonth(d, viewDate);
                                    const inRange = isInRange(d);
                                    const selected = isSelected(d);
                                    const isToday = isSameDay(d, today);
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            type="button"
                                            onClick={() => handleDateClick(d)}
                                            onDoubleClick={() => handleDateDoubleClick(d)}
                                            className={[
                                                'flex items-center justify-center text-xs rounded',
                                                inMonth ? 'text-gray-900' : 'text-gray-300',
                                                inRange && !selected ? 'bg-gray-200' : '',
                                                selected ? 'bg-blue-600 text-white' : '',
                                                !selected && inMonth ? 'hover:bg-gray-100' : '',
                                                !selected && isToday ? 'ring-2 ring-blue-500 ring-inset' : '',
                                            ].filter(Boolean).join(' ')}
                                            style={{
                                                width: DATE_RANGE_PICKER_DAY_CELL_SIZE_PX,
                                                height: DATE_RANGE_PICKER_DAY_CELL_SIZE_PX,
                                            }}
                                        >
                                            {format(d, 'd')}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Footer: match SingleDatePicker day view + range actions */}
                {!showMonthYearPicker && (
                    <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5">
                        <div className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                            Today: <span className="font-medium text-gray-700">{format(today, 'dd-MM-yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3 py-1 text-sm font-medium border border-gray-400 rounded hover:bg-gray-50"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleDone}
                                className="px-3 py-1 text-sm font-medium border border-gray-400 rounded hover:bg-gray-50"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

export default DateRangePicker;
