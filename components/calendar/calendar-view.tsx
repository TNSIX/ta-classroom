'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, X, FileText } from 'lucide-react';

// Mock Data for assignments
const mockAssignments = [
    { id: 1, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 10, 23, 59), submitted: false },
    { id: 2, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 15, 12, 0), submitted: false },
    { id: 3, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 20, 18, 30), submitted: false },
    // Many assignments on the 25th to test overflow
    { id: 4, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 9, 0), submitted: false },
    { id: 6, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 13, 15), submitted: false },
    { id: 7, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 16, 45), submitted: false },
    { id: 9, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 23, 59), submitted: false },
    { id: 16, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 13, 15), submitted: false },
    { id: 17, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 16, 45), submitted: false },
    { id: 19, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 23, 59), submitted: false },
    { id: 26, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 13, 15), submitted: false },
    { id: 27, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 16, 45), submitted: false },
    { id: 29, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 25, 23, 59), submitted: false },

    { id: 5, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 5, 23, 59), submitted: false },
    { id: 8, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 23, 23, 59), submitted: false },
    { id: 88, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 23, 23, 59), submitted: false },
    { id: 28, title: "ชื่องาน", course: "ชื่อชั้นเรียน", dueDate: new Date(2026, 1, 23, 23, 59), submitted: false },
];

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function CalendarView() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const openModal = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const getAssignmentsForDate = (date: Date) => {
        return mockAssignments.filter(a =>
            a.dueDate.getDate() === date.getDate() &&
            a.dueDate.getMonth() === date.getMonth() &&
            a.dueDate.getFullYear() === date.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 border border-blue-50/20 bg-gray-50/20"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            // Correctly checking for today
            const today = new Date();
            const isToday =
                dateObj.getDate() === today.getDate() &&
                dateObj.getMonth() === today.getMonth() &&
                dateObj.getFullYear() === today.getFullYear();

            const daysAssignments = getAssignmentsForDate(dateObj);

            // Logic for display limit
            const MAX_DISPLAY = 2;
            const displayAssignments = daysAssignments.slice(0, MAX_DISPLAY);
            const remainingCount = daysAssignments.length - MAX_DISPLAY;

            days.push(
                <div
                    key={day}
                    className={`h-40 border border-gray-100 p-2 relative group transition-colors ${isToday ? 'bg-white' : 'bg-white'}`}
                    onClick={() => daysAssignments.length > 0 && openModal(dateObj)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800'}`}>
                            {day}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {displayAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="text-sm p-1.5 rounded bg-blue-50 text-black cursor-pointer border border-transparent hover:border-blue-200 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/classroom/1/assignment/${assignment.id}/assignment_details`);
                                }}
                            >
                                <div className="font-medium flex items-center gap-1">
                                    <Clock className="w-4 h-4 flex-shrink-0 text-blue-600 mr-1" />
                                    <span className="truncate">{assignment.title}</span>
                                </div>
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <div
                                className="text-sm text-gray-800 font-medium pl-1 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(dateObj);
                                }}
                            >
                                อีก {remainingCount} รายการ
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="w-[1200px]">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl text-gray-800">ปฏิทิน</h1>
                    <p className="text-gray-500">ติดตามกำหนดการส่งงานของคุณ</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-md text-gray-800 w-40 text-center">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {DAYS.map((day) => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-800">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>
            </div>

            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-xl w-[400px] max-w-[90%] overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className=" text-lg text-gray-800">
                                วันที่ {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3">
                                {getAssignmentsForDate(selectedDate).map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                        onClick={() => {
                                            router.push(`/classroom/1/assignment/${assignment.id}/assignment_details`);
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="font-semibold text-gray-900 truncate mr-3 flex-1">{assignment.title}</div>
                                            <span className="text-sm px-3 py-1 rounded-full bg-yellow-200 text-gray-800 font-medium whitespace-nowrap">
                                                ก่อนเวลา {assignment.dueDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                                            <FileText size={14} className="flex-shrink-0" />
                                            <span className="truncate">{assignment.course}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 text-right">
                            <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

