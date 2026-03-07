import { createClient } from "@/utils/supabase/server";
import AssignmentClientDetail from "@/components/classroom/assignment/assignment-client-detail";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string, assignment_id: string }> }) {
    const { id: classroomId, assignment_id: assignmentId } = await params;
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get Role
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

    // 3. Get Assignment Data
    const { data: assignmentData, error: assignError } = await supabase
        .from('assignments')
        .select(`
            id,
            title,
            description,
            due_date,
            points,
            created_at,
            created_by,
            profiles:created_by(first_name, last_name)
        `)
        .eq('id', assignmentId)
        .single();

    if (assignError || !assignmentData) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลงานมอบหมาย หรือเกิดข้อผิดพลาด</p>
            </div>
        );
    }

    const { due_date } = assignmentData;
    let dueDatePart = null;
    let dueTimePart = null;
    if (due_date) {
        const d = new Date(due_date);
        dueDatePart = d.toISOString().split('T')[0];
        dueTimePart = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }

    // Process profile name
    const profile = Array.isArray(assignmentData.profiles) ? assignmentData.profiles[0] : assignmentData.profiles;
    const creatorName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'ผู้สอน';

    // 3.1 Fetch assignment attachments แยกต่างหาก เพื่อป้องกัน permission error พัง query ทั้งก้อน
    const { data: attachments } = await supabase
        .from('assignment_attachments')
        .select('id, file_name, file_url, file_size, file_type')
        .eq('assignment_id', assignmentId);

    const assignmentPayload = {
        title: assignmentData.title,
        description: assignmentData.description || "",
        dueDate: dueDatePart,
        dueTime: dueTimePart,
        score: assignmentData.points || 0,
        created_at: assignmentData.created_at,
        creator_name: creatorName,
        files: (attachments || []).map((att: any) => ({
            id: att.id,
            name: att.file_name,
            size: att.file_size,
            type: att.file_type || att.file_name.split('.').pop()?.toUpperCase() || 'FILE',
            file_url: att.file_url,
        })),
    };

    // 4. Get Submission Data if Student
    let studentSubmission = undefined;
    if (role === 'student' && user) {
        const { data: subData } = await supabase
            .from('submissions')
            .select(`
                id,
                status,
                submission_attachments(file_name, file_size)
            `)
            .eq('assignment_id', assignmentId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (subData) {
            studentSubmission = {
                status: subData.status,
                files: (subData.submission_attachments || []).map((att: any) => ({
                    name: att.file_name,
                    size: att.file_size,
                    type: att.file_name.split('.').pop()?.toUpperCase() || 'FILE'
                }))
            };
        }
    }

    return (
        <AssignmentClientDetail
            classroomId={classroomId}
            assignmentId={assignmentId}
            role={role}
            assignment={assignmentPayload}
            studentSubmission={studentSubmission}
        />
    );
}
