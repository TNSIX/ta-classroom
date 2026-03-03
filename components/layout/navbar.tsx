"use client";

import React, { useState } from 'react';
import { User, ChevronRight } from 'lucide-react';
import ClassMenu from './class-menu';
import InboxMenu from './inbox-menu';
import UserMenu from './user-menu';
import { usePathname } from 'next/navigation';


export default function Navbar() {
    const pathname = usePathname();

    const segments = decodeURIComponent(pathname).split('/').filter(Boolean);
    const labels: { [key: string]: string } = {
        'chat': 'แชทบอต',
        'classroom': 'ชั้นเรียน',
        'forum': 'ฟอรัม',
        'assignment': 'งานของชั้นเรียน',
        'assignment_all': 'ภาพรวมงาน',
        'assignment_details': 'รายละเอียด',
        'assignment_works': 'งานของนักเรียน',
        'grade': 'คะแนน',
        'people': 'สมาชิก',
        'calendar': 'ปฏิทิน',
        'settings': 'ตั้งค่า',
        'dashboard': 'หน้าหลัก',
    };

    return (
        <>
            <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center text-md font-medium truncate max-w-xl text-gray-600">
                    {segments.map((segment, index) => (
                        <React.Fragment key={index}>
                            <span className={index === segments.length - 1 ? "text-blue-600" : ""}>
                                {labels[segment] || segment}
                            </span>
                            {index < segments.length - 1 && (
                                <span className="mx-2 text-gray-400"><ChevronRight /></span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <InboxMenu />

                    <ClassMenu />

                    <UserMenu />
                </div>
            </nav>
        </>
    );
}