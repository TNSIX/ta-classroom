
import AssignmentHeader from "@/components/classroom/assignment/assignment-header";
import { createClient } from "@/utils/supabase/server";

interface AssignmentLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        id: string;
        assignment_id: string;
    }>;
}

export default async function AssignmentLayout({
    children,
    params,
}: AssignmentLayoutProps) {
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
        <div className="w-full">
            <AssignmentHeader role={role} />
            <div>
                {children}
            </div>
        </div>
    );
}
