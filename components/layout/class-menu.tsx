"use client"

import { useState } from 'react';
import { Plus, Users, FolderPlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateClassDialog from './create-class-dialog';
import JoinClassDialog from './join-class-dialog';

export default function ClassMenu() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                        <Plus size={20} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 overflow-hidden rounded-xl border border-gray-100 shadow-xl space-y-1">
                    <DropdownMenuItem
                        onClick={() => setIsJoinOpen(true)}
                        className="cursor-pointer py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg transition-colors flex items-center gap-3 w-full border border-transparent hover:border-blue-200"
                    >
                        <Users size={18} className='hover:text-blue-600' />
                        เข้าร่วมชั้นเรียน
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsCreateOpen(true)}
                        className="cursor-pointer py-2.5 px-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-lg transition-colors flex items-center gap-3 w-full border border-transparent hover:border-blue-200"
                    >
                        <FolderPlus size={18} className='hover:text-blue-600' />
                        สร้างชั้นเรียน
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <JoinClassDialog isOpen={isJoinOpen} onOpenChange={setIsJoinOpen} />
            <CreateClassDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </>
    );
}
