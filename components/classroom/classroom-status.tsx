'use client';

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { updateClassroomPrivacy } from "@/app/actions/classroom";

interface ClassroomStatusProps {
    classroomId: string;
    initialPrivacy: boolean;
}

export default function ClassroomStatus({ classroomId, initialPrivacy }: ClassroomStatusProps) {
    const [isPrivate, setIsPrivate] = useState<boolean>(initialPrivacy);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const options = [
        { label: 'สาธารณะ', value: false },
        { label: 'ส่วนตัว', value: true }
    ];

    const handleSelectOption = (value: boolean) => {
        setIsOpen(false);
        if (value === isPrivate) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append('id', classroomId);
            formData.append('is_private', String(value));

            const result = await updateClassroomPrivacy(null, formData);
            if (result?.success) {
                setIsPrivate(value);
            } else {
                alert(result?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะชั้นเรียน');
            }
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 py-2 pl-6 pr-2 w-64 relative">
            {/* Header and Dropdown in one line */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-md font-medium text-gray-800 whitespace-nowrap">สถานะชั้นเรียน</h2>

                {/* Dropdown */}
                <div className="relative flex-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isPending}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <span className="text-md text-blue-600">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPrivate ? 'ส่วนตัว' : 'สาธารณะ')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            {options.map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => handleSelectOption(option.value)}
                                    className={`
                                        w-full px-3 py-2 text-md text-left hover:bg-gray-100 transition-colors
                                        ${isPrivate === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-800'}
                                    `}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
