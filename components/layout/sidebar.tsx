"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Calendar, Menu, MessageCircle } from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const menuItems = [
        { name: 'แชทบอต', icon: MessageCircle, href: '/chat' },
        { name: 'ชั้นเรียน', icon: BookOpen, href: '/classroom' },
        { name: 'ปฏิทิน', icon: Calendar, href: '/calendar' },
    ];

    return (
        <div
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-full
        ${isOpen ? 'w-64' : 'w-18.5'}`}
        >
            {/* Hamburger Button */}
            <div className="p-4 flex">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-800"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            // เพิ่ม group เพื่อควบคุมลูกข้างในตอน hover
                            className={`group relative flex items-center p-3 rounded-xl transition-all duration-200 border
                  ${isActive
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'text-gray-800 border-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}
                `}
                        >
                            {/* Icon Section */}
                            <div className="flex items-center justify-ce    nter min-w-[32px]">
                                <item.icon size={24} />
                            </div>

                            {/* Text Section (แสดงเฉพาะตอนเปิด) */}
                            <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 overflow-hidden
                  ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
                            >
                                {item.name}
                            </span>

                            {/* Tooltip (แสดงเฉพาะตอนปิด sidebar และ hover) */}
                            {!isOpen && (
                                <div className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 
                    group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                    {/* ลูกศร Tooltip */}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
                                </div>
                            )}

                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}