import { createClient } from "@/utils/supabase/server";
import AssignmentWorksClient from "@/components/classroom/assignment/assignment-works-client";
import { redirect } from "next/navigation";

export default async function AssignmentWorksPage({ params }: { params: { id: string, assignment_id: string } }) {
    const { id: classroomId, assignment_id: assignmentId } = await params;
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // 2. check role (manager/creator only)
    const { data: membership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['creator', 'manager'].includes(membership.role)) {
        return redirect(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`);
    }

    // 3. Get Assignment Details
    const { data: assignment } = await supabase
        .from('assignments')
        .select('points, due_date')
        .eq('id', assignmentId)
        .single();

    if (!assignment) return <div className="p-8 text-center">ไม่พบข้อมูลงาน</div>;

    // 4. Get all students
    const { data: students } = await supabase
        .from('classroom_members')
        .select(`
            user_id,
            profiles:user_id(first_name, last_name)
        `)
        .eq('classroom_id', classroomId)
        .eq('role', 'student');

    // 5. Get all submissions and grades for this assignment
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            id,
            student_id,
            status,
            submitted_at,
            grades(score)
        `)
        .eq('assignment_id', assignmentId);

    // Merge logic
    const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
    const now = new Date();

    const mappedWorks = (students || []).map(student => {
        const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
        const sub = submissions?.find(s => s.student_id === student.user_id);

        // --- คะแนน ---
        let score: number | null = null;
        if (sub?.grades && Array.isArray(sub.grades) && sub.grades.length > 0) {
            score = sub.grades[0].score !== undefined ? Number(sub.grades[0].score) : null;
        } else if (sub?.grades && !Array.isArray(sub.grades)) {
            score = (sub.grades as any).score !== undefined ? Number((sub.grades as any).score) : null;
        }

        // --- สถานะ (ตามเงื่อนไข) ---
        let status: string;
        if (!sub) {
            // ยังไม่มีการส่งงานเลย
            status = (dueDate && dueDate < now) ? "missing" : "assigned";
        } else if (score !== null) {
            // ครูกรอกคะแนนแล้ว → ตรวจแล้ว
            status = "graded";
        } else if (sub.status === "assigned") {
            // student กดทำเครื่องหมายว่าเสร็จสิ้น (ยังไม่ได้ upload ไฟล์)
            status = "assigned";
        } else if (sub.submitted_at && dueDate && new Date(sub.submitted_at) > dueDate) {
            // ส่งหลัง due_date → ส่งช้า
            status = "late";
        } else {
            // ส่งก่อน due_date (หรือไม่มี due_date) → ส่งแล้ว
            status = "submitted";
        }

        // --- ชื่อ ---
        const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'นิรนาม (ยังไม่ตั้งชื่อ)';

        // --- วันที่ส่ง ---
        let rawDate: string | null = null;
        if (sub?.submitted_at) {
            const d = new Date(sub.submitted_at);
            const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            rawDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)} น.`;
        }

        return {
            id: student.user_id,
            name,
            avatar: '',
            status,
            submittedAt: rawDate,
            workFile: null,
            score,
        };
    });


    return (
        <div className="flex justify-center w-full">
            <AssignmentWorksClient
                classroomId={classroomId}
                assignmentId={assignmentId}
                totalScore={assignment.points}
                initialWorks={mappedWorks}
            />
        </div>
    );
}
