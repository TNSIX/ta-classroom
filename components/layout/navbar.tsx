"use client";

import React, { useState, useEffect } from 'react';
import { User, ChevronRight } from 'lucide-react';
import ClassMenu from './class-menu';
import InboxMenu from './inbox-menu';
import UserMenu from './user-menu';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';


export default function Navbar() {
    const pathname = usePathname();

    const segments = decodeURIComponent(pathname).split('/').filter(Boolean);
    const [dynamicLabels, setDynamicLabels] = useState<{ [key: string]: string }>({});

    // ฟังก์ชันตรวจสอบว่าเป็น UUID หรือไม่
    const isUUID = (str: string) => {
        const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        return regexExp.test(str);
    };

    useEffect(() => {
        const fetchDynamicNames = async () => {
            const supabase = createClient();
            const newLabels: { [key: string]: string } = {};
            let hasNew = false;

            for (const segment of segments) {
                if (isUUID(segment) && !dynamicLabels[segment]) {
                    // ลองค้นหาในตาราง classrooms ก่อน
                    const { data: classData } = await supabase
                        .from('classrooms')
                        .select('name')
                        .eq('id', segment)
                        .maybeSingle();

                    if (classData?.name) {
                        newLabels[segment] = classData.name;
                        hasNew = true;
                    } else {
                        // ถ้าไม่เจอใน classrooms ลองค้นหาในตาราง assignments
                        const { data: assignmentData } = await supabase
                            .from('assignments')
                            .select('title')
                            .eq('id', segment)
                            .maybeSingle();

                        if (assignmentData?.title) {
                            newLabels[segment] = assignmentData.title;
                            hasNew = true;
                        }
                    }
                }
            }

            if (hasNew) {
                setDynamicLabels(prev => ({ ...prev, ...newLabels }));
            }
        };

        fetchDynamicNames();
    }, [segments, dynamicLabels]);


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
        ...dynamicLabels // รวมชื่อชั้นเรียนจากฐานข้อมูลเข้าไปใน map
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