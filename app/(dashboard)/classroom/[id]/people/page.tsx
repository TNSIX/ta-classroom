import PeopleTable from "@/components/classroom/people/people-table";
import { createClient } from "@/utils/supabase/server";

export default async function PeoplePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: classroomId } = await params;
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get user role
    let role = "student";
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

    // 3. Get all members
    const { data: membersData } = await supabase
        .from('classroom_members')
        .select(`
            user_id,
            role,
            profiles:user_id ( id, first_name, last_name )
        `)
        .eq('classroom_id', classroomId);

    const members = (membersData || []).map((m: any) => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        return {
            id: m.user_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'ไม่ระบุชื่อ',
            role: m.role,
        };
    });

    const teachers = members.filter(m => m.role === 'creator' || m.role === 'manager');
    const students = members.filter(m => m.role === 'student');

    return (
        <div className="justify-items-center min-h-screen pb-12">
            <div className="flex flex-col w-[1200px] mt-8">
                <PeopleTable
                    classroomId={classroomId}
                    currentRole={role as any}
                    initialTeachers={teachers}
                    initialStudents={students}
                />
            </div>
        </div>
    );
}