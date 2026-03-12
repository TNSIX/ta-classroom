"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import ClassMenu from './class-menu';
import InboxMenu from './inbox-menu';
import UserMenu from './user-menu';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';


export default function Navbar() {
    const pathname = usePathname();
    const segments = decodeURIComponent(pathname).split('/').filter(Boolean);
    const [dynamicLabels, setDynamicLabels] = useState<{ [key: string]: string }>({});

    // ใช้ ref เก็บ UUID ที่ fetch ไปแล้ว เพื่อไม่ต้องใส่ dynamicLabels ใน dependency array
    const fetchedIds = useRef<Set<string>>(new Set());

    const isUUID = (str: string) => {
        const regexExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
        return regexExp.test(str);
    };

    useEffect(() => {
        const fetchDynamicNames = async () => {
            const supabase = createClient();
            const newLabels: { [key: string]: string } = {};
            let hasNew = false;

            for (const segment of segments) {
                if (isUUID(segment) && !fetchedIds.current.has(segment)) {
                    fetchedIds.current.add(segment); // mark ว่า fetch แล้ว ป้องกัน duplicate request

                    const { data: classData } = await supabase
                        .from('classrooms')
                        .select('name')
                        .eq('id', segment)
                        .maybeSingle();

                    if (classData?.name) {
                        newLabels[segment] = classData.name;
                        hasNew = true;
                    } else {
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
    }, [pathname]); // fetch ใหม่เมื่อเปลี่ยนหน้าเท่านั้น


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
        ...dynamicLabels
    };

    return (
        <>
            <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center text-md font-medium truncate max-w-xl text-gray-600">
                    {segments
                        .filter(segment => !isUUID(segment) || labels[segment]) // ซ่อน UUID ที่ยังไม่มีชื่อ
                        .map((segment, index, filteredArr) => (
                            <React.Fragment key={segment}>
                                <span className={index === filteredArr.length - 1 ? "text-blue-600" : ""}>
                                    {labels[segment] || segment}
                                </span>
                                {index < filteredArr.length - 1 && (
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
