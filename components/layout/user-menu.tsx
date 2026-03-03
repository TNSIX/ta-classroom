"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function UserMenu() {
    const router = useRouter();

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center p-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors outline-none cursor-pointer">
                    <User size={20} strokeWidth={1.5} />
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0 shadow-lg border-gray-200">
                <div className="flex flex-col items-center p-6 border-b bg-gray-50/50 rounded-t-md">
                    <Avatar className="h-20 w-20 border-2 shadow-sm mb-3">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                            ส
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-gray-900 text-lg">สมหมาย ใจดี</h3>
                    <p className="text-sm text-gray-500">sommai.j@example.com</p>
                </div>
                <div className="p-2 bg-white rounded-b-md">
                    <Button
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-3 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 text-md"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        ออกจากระบบ
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
