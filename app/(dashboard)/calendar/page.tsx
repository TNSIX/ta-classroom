import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
    const supabase = await createClient();

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // 2. Get classrooms where the user is a student (not creator/manager)
    const { data: memberships } = await supabase
        .from("classroom_members")
        .select("classroom_id, role, classrooms(id, name)")
        .eq("user_id", user.id);

    // Filter to only include classes where the user is not a creator or manager
    const studentClassroomIds = (memberships || [])
        .filter((m) => !["creator", "manager"].includes(m.role))
        .map((m) => m.classroom_id);

    if (studentClassroomIds.length === 0) {
        return (
            <div className="w-full flex justify-center">
                <div className="w-[1200px] my-8">
                    <CalendarView assignments={[]} userRole="student" />
                </div>
            </div>
        );
    }

    // 3. Get all assignments for those classrooms
    const { data: assignments } = await supabase
        .from("assignments")
        .select("id, title, due_date, classroom_id, classrooms(name)")
        .in("classroom_id", studentClassroomIds)
        .not("due_date", "is", null)
        .order("due_date", { ascending: true });

    // 4. Get submissions of this user (for student status)
    const { data: submissions } = await supabase
        .from("submissions")
        .select("assignment_id, status")
        .eq("student_id", user.id);

    const submissionMap: Record<string, string> = {};
    (submissions || []).forEach((s) => {
        submissionMap[s.assignment_id] = s.status;
    });

    // 5. Build assignment list for calendar
    const calendarAssignments = (assignments || []).map((a) => {
        const classroomName = Array.isArray(a.classrooms)
            ? a.classrooms[0]?.name
            : (a.classrooms as any)?.name;

        const submissionStatus = submissionMap[a.id] || null;

        return {
            id: a.id,
            title: a.title,
            course: classroomName || "ไม่ระบุชั้นเรียน",
            classroomId: a.classroom_id,
            dueDate: a.due_date,
            submissionStatus,
        };
    });

    return (
        <div className="w-full flex justify-center">
            <div className="w-[1200px] my-8">
                <CalendarView
                    assignments={calendarAssignments}
                    userRole="student"
                />
            </div>
        </div>
    );
}
