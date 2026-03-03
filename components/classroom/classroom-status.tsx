'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ClassroomStatus() {
    const [status, setStatus] = useState<'สาธารณะ' | 'ส่วนตัว'>('สาธารณะ');
    const [isOpen, setIsOpen] = useState(false);

    const options: Array<'สาธารณะ' | 'ส่วนตัว'> = ['สาธารณะ', 'ส่วนตัว'];

    return (
        <div className="bg-white rounded-xl border border-gray-200 py-2 pl-6 pr-2 w-64">
            {/* Header and Dropdown in one line */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-md font-medium text-gray-800 whitespace-nowrap">สถานะชั้นเรียน</h2>

                {/* Dropdown */}
                <div className="relative flex-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-md text-blue-600">{status}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setStatus(option);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full px-3 py-2 text-md text-left hover:bg-gray-100 transition-colors
                                        ${status === option ? 'bg-blue-50 text-blue-600' : 'text-gray-800'}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
