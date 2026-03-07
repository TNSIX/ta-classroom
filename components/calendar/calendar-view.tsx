'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock, X, FileText } from 'lucide-react';

export interface CalendarAssignment {
    id: string;
    title: string;
    course: string;
    classroomId: string;
    dueDate: string; // ISO string
    submissionStatus: string | null; // 'submitted' | 'late' | 'graded' | 'assigned' | null
}

interface CalendarViewProps {
    assignments: CalendarAssignment[];
    userRole: 'teacher' | 'student';
}

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function CalendarView({ assignments, userRole }: CalendarViewProps) {
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
        return assignments.filter((a) => {
            const d = new Date(a.dueDate);
            return (
                d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
            );
        });
    };

    // เลือกสีของ chip ตาม submission status
    const getChipStyle = (a: CalendarAssignment) => {
        if (userRole === 'teacher') return 'bg-blue-50 border-blue-100 text-blue-800';
        switch (a.submissionStatus) {
            case 'graded': return 'bg-purple-50 border-purple-100 text-purple-800';
            case 'submitted':
            case 'assigned': return 'bg-green-50 border-green-100 text-green-800';
            case 'late': return 'bg-orange-50 border-orange-100 text-orange-800';
            default: return 'bg-blue-50 border-blue-100 text-blue-800'; // ยังไม่ส่ง
        }
    };

    const getStatusLabel = (a: CalendarAssignment) => {
        if (userRole === 'teacher') return null;
        switch (a.submissionStatus) {
            case 'graded': return <span className="text-xs text-purple-600 font-medium">ตรวจแล้ว</span>;
            case 'submitted': return <span className="text-xs text-green-600 font-medium">ส่งแล้ว</span>;
            case 'assigned': return <span className="text-xs text-green-600 font-medium">มอบหมายแล้ว</span>;
            case 'late': return <span className="text-xs text-orange-600 font-medium">ส่งช้า</span>;
            default: return <span className="text-xs text-blue-600 font-medium">ยังไม่ส่ง</span>;
        }
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();

        const days = [];

        // Empty cells before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-36 border border-gray-100 bg-gray-50/50" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const isToday =
                dateObj.getDate() === today.getDate() &&
                dateObj.getMonth() === today.getMonth() &&
                dateObj.getFullYear() === today.getFullYear();
            const isPast = dateObj < today && !isToday;

            const daysAssignments = getAssignmentsForDate(dateObj);
            const MAX_DISPLAY = 2;
            const displayAssignments = daysAssignments.slice(0, MAX_DISPLAY);
            const remainingCount = daysAssignments.length - MAX_DISPLAY;

            days.push(
                <div
                    key={day}
                    className={`h-36 border border-gray-100 p-1.5 relative transition-colors
                        ${daysAssignments.length > 0 ? 'cursor-pointer hover:bg-blue-50/30' : ''}
                        ${isPast ? 'bg-gray-50/70' : 'bg-white'}`}
                    onClick={() => daysAssignments.length > 0 && openModal(dateObj)}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-blue-600 text-white' : isPast ? 'text-gray-400' : 'text-gray-800'}`}>
                            {day}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {displayAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className={`text-xs px-1.5 py-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getChipStyle(assignment)}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/classroom/${assignment.classroomId}/assignment/${assignment.id}/assignment_details`);
                                }}
                            >
                                <div className="flex items-center gap-1">
                                    <Clock size={15} className="flex-shrink-0 opacity-70" />
                                    <span className="truncate font-medium text-sm">{assignment.title}</span>
                                </div>
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <div
                                className="text-xs text-gray-500 font-medium pl-1 hover:text-blue-600 cursor-pointer transition-colors"
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
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {DAYS.map((day) => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Day Detail Modal */}
            {isModalOpen && selectedDate && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-150"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-[420px] max-w-[90vw] overflow-hidden animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-800">
                                วันที่ {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Assignment List */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3">
                                {getAssignmentsForDate(selectedDate).map((assignment) => {
                                    const dueTime = new Date(assignment.dueDate).toLocaleTimeString('th-TH', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    return (
                                        <div
                                            key={assignment.id}
                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors ${getChipStyle(assignment)}`}
                                            onClick={() => {
                                                router.push(`/classroom/${assignment.classroomId}/assignment/${assignment.id}/assignment_details`);
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-1.5 gap-2">
                                                <div className="font-semibold text-gray-900 truncate flex-1">
                                                    {assignment.title}
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-white/70 text-gray-700 font-medium whitespace-nowrap border border-gray-200">
                                                    {dueTime} น.
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 min-w-0">
                                                    <FileText size={13} className="flex-shrink-0" />
                                                    <span className="truncate">{assignment.course}</span>
                                                </div>
                                                {getStatusLabel(assignment)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
