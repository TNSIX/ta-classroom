"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// กำหนด type สำหรับบทบาท
export type Role = "creator" | "manager" | "member";

const tabs = [
    { name: "รายละเอียด", href: "/assignment_details" },
    { name: "งานของนักเรียน", href: "/assignment_works", hideFor: ["member"] },
];

export default function AssignmentHeader({ role = "creator" }: { role?: Role }) {
    const pathname = usePathname();
    const params = useParams();

    // useParams returns string | string[] | undefined, so we need to cast or handle it
    const classroomId = params?.id as string;
    const assignmentId = params?.assignment_id as string;

    return (
        <nav className="flex items-center justify-start border-b bg-white px-4 h-16 w-full">
            <div className="flex space-x-2 sm:space-x-4">
                {tabs.map((tab) => {
                    // ซ่อนแท็บหากบทบาทตรงกับที่ระบุใน hideFor
                    if (tab.hideFor?.includes(role)) return null;

                    // Ensure we have IDs before simpler constructing the path to avoid "undefined" in URL
                    if (!classroomId || !assignmentId) return null;

                    const fullPath = `/classroom/${classroomId}/assignment/${assignmentId}${tab.href}`;
                    const assignmentRoot = `/classroom/${classroomId}/assignment/${assignmentId}`;
                    const isActive = pathname.startsWith(fullPath) ||
                        (tab.href === "/assignment_works" && pathname.startsWith(`${assignmentRoot}/assignment_all`));

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