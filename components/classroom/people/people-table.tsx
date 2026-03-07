"use client";

import { useTransition } from "react";
import { User, MoreVertical, ShieldCheck, Mail, UserMinus, UserCog, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { changeMemberRole, removeMember } from "@/app/actions/people";

export type Role = "creator" | "manager" | "student";

interface Member {
    id: string;
    name: string;
    email?: string;
    role: string;
}

interface PeopleTableProps {
    classroomId: string;
    currentRole: Role;
    initialTeachers: Member[];
    initialStudents: Member[];
}

export default function PeopleTable({ classroomId, currentRole, initialTeachers, initialStudents }: PeopleTableProps) {
    const [isPending, startTransition] = useTransition();

    const handleDemoteToStudent = (userId: string) => {
        if (!confirm("ต้องการเปลี่ยนบทบาทเป็นสมาชิกใช่หรือไม่?")) return;
        startTransition(async () => {
            const result = await changeMemberRole(classroomId, userId, 'student');
            if (result?.error) alert(result.error);
        });
    };

    const handlePromoteToManager = (userId: string) => {
        if (!confirm("ต้องการแต่งตั้งเป็นผู้จัดการชั้นเรียนใช่หรือไม่?")) return;
        startTransition(async () => {
            const result = await changeMemberRole(classroomId, userId, 'manager');
            if (result?.error) alert(result.error);
        });
    };

    const handleRemoveUser = (userId: string) => {
        if (!confirm("ต้องการนำผู้ใช้นี้ออกจากชั้นเรียนใช่หรือไม่?")) return;
        startTransition(async () => {
            const result = await removeMember(classroomId, userId);
            if (result?.error) alert(result.error);
        });
    };

    return (
        <div className="w-full mx-auto space-y-8 pb-12 relative">

            {/* Overlay during pending state */}
            {isPending && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-xl">
                    <div className="bg-white p-4 rounded-full shadow-lg flex items-center gap-3 border border-gray-100">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <span className="text-gray-700 font-medium">กำลังดำเนินการ...</span>
                    </div>
                </div>
            )}

            {/* ส่วนของครูผู้สอน (Teachers Section) */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${isPending ? 'opacity-70 pointer-events-none' : ''} transition-opacity`}>
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-md text-blue-600">ผู้สร้างและดูแลชั้นเรียน</h2>
                    </div>
                    <span className="bg-gray-100 text-gray-500 py-1 px-3 rounded-full text-sm font-medium">
                        {initialTeachers.length} คน
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {initialTeachers.map((teacher, index) => (
                        <div key={teacher.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${teacher.role === 'creator' ? 'bg-blue-600' : 'bg-blue-400'}`}>
                                    {teacher.role === 'creator' ? <ShieldCheck size={24} /> : <UserCog size={24} />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 text-md">{teacher.name}</div>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        {teacher.role === 'creator' ? 'ผู้สร้างชั้นเรียน' : 'ผู้จัดการชั้นเรียน'}
                                    </div>
                                </div>
                            </div>
                            {currentRole === "creator" && teacher.role !== "creator" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50">
                                            <MoreVertical size={16} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
                                        <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200" onClick={() => handleDemoteToStudent(teacher.id)}>
                                            <User className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                            เปลี่ยนตำแหน่งเป็นสมาชิก
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200" onClick={() => handleRemoveUser(teacher.id)}>
                                            <UserMinus className="h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                            นำออกจากชั้นเรียน
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ส่วนของเพื่อนร่วมชั้น (Classmates Section) */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${isPending ? 'opacity-70 pointer-events-none' : ''} transition-opacity`}>
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-md text-blue-600">สมาชิก</h2>
                    </div>
                    <span className="bg-gray-100 text-gray-500 py-1 px-3 rounded-full text-sm font-medium">
                        {initialStudents.length} คน
                    </span>
                </div>
                {initialStudents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        ยังไม่มีสมาชิกในชั้นเรียนนี้
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {initialStudents.map((student) => (
                            <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{student.name}</div>
                                        <div className="text-sm text-gray-400 flex items-center gap-1">สมาชิกในชั้นเรียน</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(currentRole === "creator" || currentRole === "manager") && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
                                                {currentRole === "creator" && (
                                                    <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200" onClick={() => handlePromoteToManager(student.id)}>
                                                        <ShieldCheck className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                                        เปลี่ยนตำแหน่งเป็นผู้จัดการชั้นเรียน
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200" onClick={() => handleRemoveUser(student.id)}>
                                                    <UserMinus className="h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                                    นำออกจากชั้นเรียน
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
