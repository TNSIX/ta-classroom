"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, LogOut, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/(auth)/actions';

export default function UserMenu() {
    const [user, setUser] = React.useState<any>(null);
    const [isLoggingOut, startTransition] = React.useTransition();
    const supabase = createClient();

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'กำลังโหลด';
    const lastName = user?.user_metadata?.last_name || (user?.user_metadata?.full_name?.split(' ').slice(1).join(' ')) || '';
    const email = user?.email || 'กำลังโหลดข้อมูล...';
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
    const initial = firstName !== 'กำลังโหลด' && firstName ? firstName.charAt(0).toUpperCase() : '?';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 text-gray-800 hover:text-blue-600 rounded-full transition-colors outline-none cursor-pointer">
                    {user ? (
                        <Avatar className="h-8 w-8 border shadow-sm">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <User size={20} strokeWidth={2} />
                    )}
                    {user && <span className="text-md font-medium truncate max-w-[120px]">{firstName}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-100 p-0 shadow-lg border-gray-200">
                <div className="flex items-center p-4 border-b bg-gray-50/50 rounded-t-md gap-4">
                    <Avatar className="h-14 w-14 border shadow-sm flex-shrink-0">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold">
                            {initial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-gray-900 text-base truncate">{firstName} {lastName}</h3>
                        <p className="text-sm text-gray-500 truncate">{email}</p>
                    </div>
                </div>
                <div className="p-2 bg-white rounded-b-md">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => startTransition(async () => { await logout(); })}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-start gap-3 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 text-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                        {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
