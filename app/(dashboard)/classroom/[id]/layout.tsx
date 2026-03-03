// src/app/(dashboard)/classrooms/[id]/layout.tsx
import ClassroomHeader from "@/components/classroom/classroom-header";

export default function SingleClassroomLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string }; // รับ ID ของห้องเรียนจาก URL
}) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* 1. ส่วน Header ที่จะค้างไว้ตลอดในหน้านี้ */}
            <div>
                <ClassroomHeader />
            </div>


            {/* 2. เนื้อหาของแต่ละหน้าย่อย (page.tsx ของแต่ละโฟลเดอร์) */}
            <main>
                {children}
            </main>
        </div>
    );
}