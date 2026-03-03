"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils"; // ฟังก์ชันช่วยจัดการ class (มาตรฐาน shadcn)

// กำหนด type สำหรับบทบาท เผื่อรับผ่าน props 
export type Role = "creator" | "manager" | "member";

const tabs = [
    { name: "ฟอรัม", href: "/forum" }, // หน้าหลักของห้องเรียน [id]
    { name: "งานของชั้นเรียน", href: "/assignment" },
    { name: "คะแนน", href: "/grade", hideFor: ["member"] }, // หรือจะเปลี่ยนเป็น /settings ตามโครงสร้างคุณ
    { name: "สมาชิก", href: "/people" },
];

export default function ClassroomHeader({ role = "creator" }: { role?: Role }) {
    const pathname = usePathname();
    const params = useParams();
    const classroomId = params?.id as string;

    return (
        <nav className="flex items-center justify-start border-b bg-white px-4 h-16 w-full">
            <div className="flex space-x-2 sm:space-x-4">
                {tabs.map((tab) => {
                    if (!classroomId) return null;

                    // ซ่อนแท็บหากบทบาทปัจจุบันตรงกับที่ระบุใน hideFor
                    if (tab.hideFor?.includes(role)) return null;

                    // สร้าง full path เพื่อเช็ค Active state
                    const fullPath = `/classroom/${classroomId}${tab.href}`;
                    const isActive = pathname.startsWith(fullPath);

                    return (
                        <Link
                            key={tab.name}
                            href={fullPath}
                            className={cn(
                                "px-6 py-2 rounded-full text-md font-medium transition-colors border",
                                isActive
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "text-gray-600 border-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}