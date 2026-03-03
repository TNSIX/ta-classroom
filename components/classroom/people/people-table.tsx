"use client";

import { useState } from "react";
import { User, MoreVertical, ShieldCheck, Mail, UserMinus, UserCog } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Role = "creator" | "manager" | "member";

export default function PeopleTable({ role = "creator" }: { role?: Role }) {
    // ข้อมูลจำลอง (Mock Data)
    const [teachers, setTeachers] = useState([
        { id: 1, name: "อาจารย์สมศักดิ์ รักเรียน", email: "somsak@example.com", role: "creator" },
        { id: 2, name: "อาจารย์ใจดี มีสุข", email: "jaidee@example.com", role: "manager" },
    ]);

    const [students, setStudents] = useState([
        { id: 11, name: "นายสมชาย เรียนเก่ง", email: "somchai@student.com", role: "member" },
        { id: 12, name: "นางสาวสมหญิง ตั้งใจ", email: "somying@student.com", role: "member" },
        { id: 13, name: "นายมานี มีมานะ", email: "manee@student.com", role: "member" },
        { id: 14, name: "นายปิติ ชูใจ", email: "piti@student.com", role: "member" },
        { id: 15, name: "นายชูใจ รักดี", email: "chujai@student.com", role: "member" },
        { id: 16, name: "นายชูใจ รักดี", email: "chujai@student.com", role: "member" },
        { id: 17, name: "นายชูใจ รักดี", email: "chujai@student.com", role: "member" },
        { id: 18, name: "นายชูใจ รักดี", email: "chujai@student.com", role: "member" },
    ]);

    const handleDemoteToStudent = (teacherId: number) => {
        const teacher = teachers.find(t => t.id === teacherId);
        if (teacher) {
            setTeachers(prev => prev.filter(t => t.id !== teacherId));
            setStudents(prev => [...prev, teacher]);
        }
    };

    const handlePromoteToTeacher = (studentId: number) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            setTeachers(prev => [...prev, student]);
        }
    };

    const handleRemoveUser = (userId: number, isTeacher: boolean) => {
        if (isTeacher) {
            setTeachers(prev => prev.filter(t => t.id !== userId));
        } else {
            setStudents(prev => prev.filter(s => s.id !== userId));
        }
    };

    return (
        <div className="w-full mx-auto space-y-8 pb-12">
            {/* ส่วนของครูผู้สอน (Teachers Section) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-md text-blue-600">ผู้สร้างและดูแลชั้นเรียน</h2>
                    </div>
                    <span className="bg-gray-100 text-gray-500 py-1 px-3 rounded-full text-sm font-medium">
                        {teachers.length} คน
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {teachers.map((teacher, index) => (
                        <div key={teacher.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${index === 0 ? 'bg-blue-600' : 'bg-blue-400'}`}>
                                    {index === 0 ? <ShieldCheck size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 text-md">{teacher.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-gray-400">
                                            <Mail size={12} /> {teacher.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {role === "creator" && teacher.role !== "creator" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
                                        <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200" onClick={() => handleDemoteToStudent(teacher.id)}>
                                            <User className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                            เปลี่ยนตำแหน่งเป็นสมาชิก
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200" onClick={() => handleRemoveUser(teacher.id, true)}>
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-md text-blue-600">สมาชิก</h2>
                    </div>
                    <span className="bg-gray-100 text-gray-500 py-1 px-3 rounded-full text-sm font-medium">
                        {students.length} คน
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {students.map((student) => (
                        <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-400 flex items-center gap-1">
                                        <Mail size={12} /> {student.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {(role === "creator" || role === "manager") && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
                                            {role === "creator" && (
                                                <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200" onClick={() => handlePromoteToTeacher(student.id)}>
                                                    <ShieldCheck className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                                    เปลี่ยนตำแหน่งเป็นผู้จัดการชั้นเรียน
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200" onClick={() => handleRemoveUser(student.id, false)}>
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
            </div>
        </div>
    );
}
