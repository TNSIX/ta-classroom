"use client";

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Inbox, FileText, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Mock Data Types
type NotificationType = 'join_request' | 'new_assignment' | 'new_announcement';

interface NotificationBase {
    id: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
}

interface JoinRequestNotification extends NotificationBase {
    type: 'join_request';
    user: {
        name: string;
        avatar: string;
    };
    className: string;
}

interface NewAssignmentNotification extends NotificationBase {
    type: 'new_assignment';
    className: string;
    assignmentName: string;
    dueDate: string | null;
}

interface NewAnnouncementNotification extends NotificationBase {
    type: 'new_announcement';
    className: string;
}

type Notification = JoinRequestNotification | NewAssignmentNotification | NewAnnouncementNotification;

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'join_request',
        user: { name: 'นายจิตรกร ขยันทำ', avatar: '' },
        className: 'Web Development 101',
        isRead: false,
        createdAt: '10 นาทีที่แล้ว'
    },
    {
        id: '2',
        type: 'new_assignment',
        className: 'การเขียนโปรแกรมเชิงวัตถุ',
        assignmentName: 'ออกแบบ Class Diagram โรงพยาบาล',
        dueDate: '31 ต.ค. 2023',
        isRead: false,
        createdAt: '1 ชั่วโมงที่แล้ว'
    },
    {
        id: '3',
        type: 'new_assignment',
        className: 'อัลกอริทึมและโครงสร้างข้อมูล',
        assignmentName: 'โจทย์ปัญหา Search & Sort',
        dueDate: null,
        isRead: true,
        createdAt: '2 ชั่วโมงที่แล้ว'
    },
    {
        id: '4',
        type: 'new_announcement',
        className: 'วิทยาการข้อมูลเบื้องต้น',
        isRead: false,
        createdAt: '3 ชั่วโมงที่แล้ว'
    }
];

export default function InboxMenu() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    // จำลองการอนุมัติ/ปฏิเสธ โดยการลบข้อความทิ้งไปเลยสำหรับตัวอย่าง
    const handleApprove = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleReject = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="p-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors relative">
                    <Inbox size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-lg border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-lg">
                    <h3 className="font-semibold text-gray-900 text-md">กล่องข้อความ</h3>
                    {notifications.length > 0 && (
                        <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-full font-medium"
                        >
                            เคลียร์
                        </button>
                    )}
                </div>
                <div className="flex flex-col max-h-[400px] overflow-y-auto bg-white rounded-b-lg">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            ไม่มีข้อความใหม่
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map(notification => (
                                <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/20' : ''}`}>
                                    {notification.type === 'join_request' && (
                                        <div className="flex gap-3">
                                            <Avatar className="h-10 w-10 border shadow-sm mt-0.5">
                                                <AvatarImage src={notification.user.avatar} />
                                                <AvatarFallback className="bg-blue-100 text-blue-700">{notification.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <p className="text-sm leading-relaxed text-gray-800">
                                                    <span className="font-semibold text-gray-900">{notification.user.name}</span> ได้ส่งคำขอเข้าร่วมชั้นเรียน <span className="font-semibold text-gray-900">{notification.className}</span>
                                                </p>
                                                <div className="flex gap-2 pt-1">
                                                    <Button variant="outline" size="sm" className="h-8 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleReject(notification.id)}>
                                                        ปฏิเสธ
                                                    </Button>
                                                    <Button size="sm" className="h-8 flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => handleApprove(notification.id)}>
                                                        อนุมัติ
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">{notification.createdAt}</p>
                                            </div>
                                        </div>
                                    )}
                                    {notification.type === 'new_assignment' && (
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                    <FileText size={20} />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm leading-relaxed text-gray-800">
                                                    <span className="font-semibold text-blue-600">{notification.className}</span> มีงานใหม่ <span className="font-semibold text-gray-900">{notification.assignmentName}</span>
                                                </p>
                                                <p className="text-sm text-gray-700 bg-gray-50 inline-block px-2 py-1 rounded-md mt-1 border border-gray-200">
                                                    กำหนดส่ง: {notification.dueDate ? <span className="">{notification.dueDate}</span> : <span className="text-gray-500">ไม่มีกำหนดส่ง</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium pt-1">{notification.createdAt}</p>
                                            </div>
                                        </div>
                                    )}
                                    {notification.type === 'new_announcement' && (
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-sm">
                                                    <Megaphone size={20} />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm leading-relaxed text-gray-800">
                                                    <span className="font-semibold text-blue-600">{notification.className}</span> มีประกาศใหม่
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium pt-1">{notification.createdAt}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
