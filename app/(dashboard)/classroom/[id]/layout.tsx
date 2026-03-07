// src/app/(dashboard)/classrooms/[id]/layout.tsx
import ClassroomHeader from "@/components/classroom/classroom-header";
import { createClient } from "@/utils/supabase/server";

export default async function SingleClassroomLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>; // รับ ID ของห้องเรียนจาก URL
}) {
    const { id: classroomId } = await params;
    const supabase = await createClient();

    // Get User Role
    const { data: { user } } = await supabase.auth.getUser();
    let role: "creator" | "manager" | "student" = "student";

    if (user) {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single();

        if (membership) {
            role = membership.role as any;
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* 1. ส่วน Header ที่จะค้างไว้ตลอดในหน้านี้ */}
            <div>
                <ClassroomHeader role={role} />
            </div>


            {/* 2. เนื้อหาของแต่ละหน้าย่อย (page.tsx ของแต่ละโฟลเดอร์) */}
            <main>
                {children}
            </main>
        </div>
    );
}