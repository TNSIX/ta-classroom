import CreateAssignmentButton from "@/components/classroom/assignment/create-assignment-button";
import AssignmentPost from "@/components/classroom/assignment/post";
import ClassroomID from "@/components/classroom/classroom-id";
import ClassroomStatus from "@/components/classroom/classroom-status";
import NonAssignment from "@/components/classroom/assignment/no-post";
import { createClient } from "@/utils/supabase/server";

export type role = "creator" | "manager" | "member" | "student";

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: classroomId } = await params;
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get user role in this class and class info
    let role = "member";
    let classCode = "";
    let isPrivate = false;
    if (user) {
        const { data: membership } = await supabase
            .from('classroom_members')
            .select('role')
            .eq('classroom_id', classroomId)
            .eq('user_id', user.id)
            .single();
        if (membership) {
            role = membership.role;
        }
    }

    // 2.1 Fetch class info
    const { data: classroom } = await supabase
        .from('classrooms')
        .select('join_code, is_private')
        .eq('id', classroomId)
        .single();

    if (classroom) {
        classCode = classroom.join_code;
        isPrivate = classroom.is_private;
    }

    // 3. Fetch assignments
    const { data: assignments } = await supabase
        .from('assignments')
        .select(`
            id,
            title,
            description,
            due_date,
            points,
            created_at
        `)
        .eq('classroom_id', classroomId)
        .order('created_at', { ascending: false });

    // 3.1 Fetch assignment_attachments แยกต่างหาก และจัดกลุ่มตาม assignment_id
    let attachmentsMap: Record<string, any[]> = {};
    if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const { data: attachments } = await supabase
            .from('assignment_attachments')
            .select('id, assignment_id, file_name, file_url, file_size, file_type')
            .in('assignment_id', assignmentIds);

        if (attachments) {
            for (const att of attachments) {
                if (!attachmentsMap[att.assignment_id]) attachmentsMap[att.assignment_id] = [];
                attachmentsMap[att.assignment_id].push(att);
            }
        }
    }



    return (
        <div className="justify-items-center">
            <div className="flex flex-col items-start">
                <div className="flex w-[1200px] min-h-screen mt-8">
                    <div className="w-1/4 flex flex-col">
                        {role !== "student" && role !== "member" && (
                            <div className="pb-2">
                                <CreateAssignmentButton classroomId={classroomId} />
                            </div>
                        )}
                        {role !== "student" && role !== "member" && (
                            <div className="pb-2">
                                <ClassroomStatus classroomId={classroomId} initialPrivacy={isPrivate} />
                            </div>
                        )}
                        <div>
                            {classCode && <ClassroomID classCode={classCode} />}
                        </div>

                    </div>
                    <div className="w-3/4">
                        <div className="space-y-4">
                            {(assignments && assignments.length > 0) ? (
                                assignments.map((assignment: any) => (
                                    <AssignmentPost
                                        key={assignment.id}
                                        classroomId={classroomId}
                                        assignmentId={assignment.id}
                                        initialTitle={assignment.title}
                                        initialDescription={assignment.description}
                                        dueDate={assignment.due_date}
                                        points={assignment.points}
                                        createdAt={assignment.created_at}
                                        role={role as any}
                                        initialFiles={(attachmentsMap[assignment.id] || []).map((att: any) => ({
                                            id: att.id,
                                            name: att.file_name,
                                            size: att.file_size,
                                            type: att.file_type || att.file_name.split('.').pop()?.toUpperCase() || 'FILE',
                                            file_url: att.file_url,
                                        }))}
                                    />
                                ))
                            ) : (
                                <NonAssignment />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}