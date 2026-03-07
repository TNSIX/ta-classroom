"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Inbox, FileText, Megaphone, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/app/actions/classroom';

export default function InboxMenu() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isOpen) {
            refreshNotifications();
        } else {
            // Also fetch once on mount to show badge count
            refreshNotifications();
        }
    }, [isOpen]);

    const refreshNotifications = async () => {
        const requests = await getPendingJoinRequests();
        setNotifications(requests);
    };

    const handleApprove = (id: string, classroomId: string) => {
        startTransition(async () => {
            const result = await approveJoinRequest(id, classroomId);
            if (result.success) {
                await refreshNotifications();
            } else {
                alert(result.error);
            }
        });
    };

    const handleReject = (id: string, classroomId: string) => {
        startTransition(async () => {
            const result = await rejectJoinRequest(id, classroomId);
            if (result.success) {
                await refreshNotifications();
            } else {
                alert(result.error);
            }
        });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="p-2 text-gray-800 hover:text-blue-600 rounded-full transition-colors relative">
                    <Inbox size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-lg border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-lg">
                    <h3 className="font-semibold text-gray-900 text-md">กล่องข้อความ</h3>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                </div>
                <div className="flex flex-col max-h-[400px] overflow-y-auto bg-white rounded-b-lg">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            ไม่มีคำขอใหม่
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
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isPending}
                                                        className="h-8 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        onClick={() => handleReject(notification.id, notification.classroomId)}
                                                    >
                                                        ปฏิเสธ
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={isPending}
                                                        className="h-8 flex-1 bg-blue-600 hover:bg-blue-700 shadow-sm"
                                                        onClick={() => handleApprove(notification.id, notification.classroomId)}
                                                    >
                                                        อนุมัติ
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">{notification.createdAt}</p>
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
