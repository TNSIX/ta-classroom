import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AssignmentAllClient, { Student, FileItem } from "@/components/classroom/assignment/assignment-all-client";

export default async function AssignmentAllPage({ params }: { params: { id: string, assignment_id: string } }) {
    const { id: classroomId, assignment_id: assignmentId } = await params;
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // 2. Check Role (manager/creator only)
    const { data: membership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single();

    if (!membership || !['creator', 'manager'].includes(membership.role)) {
        return redirect(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`);
    }

    // 3. Get Assignment Info
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

    // 5. Get submissions + grades + attachments
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            id,
            student_id,
            status,
            submitted_at,
            grades(score),
            submission_attachments(id, file_name, file_url, file_size)
        `)
        .eq('assignment_id', assignmentId);

    // Helpers
    const formatSize = (bytes: number) => {
        if (!bytes) return "0 KB";
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        return (bytes / 1024).toFixed(0) + " KB";
    };

    const typeMap: Record<string, string> = {
        'pdf': 'pdf',
        'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'webp': 'image',
        'doc': 'doc', 'docx': 'doc',
        'txt': 'txt'
    };

    const getFileType = (fileName: string): "pdf" | "image" | "doc" | "txt" | "other" => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        return (typeMap[ext] as any) || 'other';
    };

    // 6. Merge Data
    const mappedStudents: Student[] = (students || []).map(student => {
        const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
        const sub = submissions?.find(s => s.student_id === student.user_id);

        let score = null;
        if (sub?.grades && Array.isArray(sub.grades) && sub.grades.length > 0) {
            score = sub.grades[0].score;
        } else if (sub?.grades && !Array.isArray(sub.grades)) {
            score = (sub.grades as any).score;
        }

        let status = "assigned";
        if (sub) {
            status = sub.status;
            if (score !== null) status = 'graded';
        } else if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
            status = "missing"; // late missing
        }

        const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'นิรนาม (ยังไม่ตั้งชื่อ)';

        let rawDate = null;
        if (sub?.submitted_at) {
            const d = new Date(sub.submitted_at);
            const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            rawDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
        }

        const files: FileItem[] = (sub?.submission_attachments || []).map((att: any) => ({
            id: att.id,
            name: att.file_name,
            type: getFileType(att.file_name),
            url: att.file_url,
            size: formatSize(att.file_size)
        }));

        return {
            id: student.user_id,
            name: name,
            avatar: '',
            status: status as any,
            submittedAt: rawDate,
            files: files,
            score: score !== null ? Number(score) : null,
        };
    });

    return (
        <AssignmentAllClient
            classroomId={classroomId}
            assignmentId={assignmentId}
            totalScore={assignment.points || 100}
            initialStudents={mappedStudents}
        />
    );
}

