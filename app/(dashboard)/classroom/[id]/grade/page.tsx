import ExportGradesButton from "@/components/classroom/grade/export-grades-button";
import GradeTable from "@/components/classroom/grade/grade-table";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function GradePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: classroomId } = await params;
    const supabase = await createClient();

    // 1. Get current user and role
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userMembership } = await supabase
        .from('classroom_members')
        .select('role')
        .eq('classroom_id', classroomId)
        .eq('user_id', user?.id)
        .single();

    const role = userMembership?.role || 'student';
    const isStudent = role === 'student';

    if (isStudent) {
        return redirect(`/classroom/${classroomId}/forum`);
    }

    // 2. Fetch Class Info
    const { data: classroom } = await supabase
        .from('classrooms')
        .select('name')
        .eq('id', classroomId)
        .single();
    const classroomName = classroom?.name || "Classroom";

    // 3. Fetch Assignments
    const { data: assignmentData } = await supabase
        .from('assignments')
        .select('id, title, points')
        .eq('classroom_id', classroomId)
        .order('created_at', { ascending: true });

    const assignments = (assignmentData || []).map(a => ({
        id: a.id,
        name: a.title,
        maxScore: Number(a.points) || 100,
    }));

    // 4. Fetch Students in Classroom
    const { data: memberData } = await supabase
        .from('classroom_members')
        .select(`
            user_id,
            profiles:user_id ( id, first_name, last_name )
        `)
        .eq('classroom_id', classroomId)
        .eq('role', 'student');

    let allStudents = (memberData || []).map((m: any) => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        return {
            id: m.user_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'ไม่ระบุชื่อ',
            scores: {} as Record<string, number>
        };
    });

    // If role is student, only show their own grades
    // Now disabled since we redirect students away.

    // 5. Fetch Submissions and Grades
    if (assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const { data: submissionData } = await supabase
            .from('submissions')
            .select(`
                student_id,
                assignment_id,
                grades ( score )
            `)
            .in('assignment_id', assignmentIds);

        (submissionData || []).forEach((sub: any) => {
            const student = allStudents.find(s => s.id === sub.student_id);
            if (student) {
                const gradeObj = Array.isArray(sub.grades) ? sub.grades[0] : sub.grades;
                if (gradeObj && gradeObj.score !== null && gradeObj.score !== undefined) {
                    student.scores[sub.assignment_id] = Number(gradeObj.score);
                }
            }
        });
    }

    const students = allStudents;

    // Calculate Statistics
    const studentTotals = students.length > 0 ? students.map(student =>
        assignments.reduce((acc, curr) => acc + (student.scores[curr.id] || 0), 0)
    ) : [0];

    const minScore = studentTotals.length > 0 ? Math.min(...studentTotals) : 0;
    const maxScore = studentTotals.length > 0 ? Math.max(...studentTotals) : 0;
    const sumScore = studentTotals.reduce((a, b) => a + b, 0);
    const avgScore = studentTotals.length > 0 ? sumScore / studentTotals.length : 0;

    // Variance and SD
    const variance = studentTotals.length > 0
        ? studentTotals.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / studentTotals.length
        : 0;
    const sdScore = Math.sqrt(variance);

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
                <p className="text-md font-medium text-gray-500 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className=" text-gray-900">{typeof value === 'number' ? value.toFixed(2) : value}</h3>
                    {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
                </div>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );

    return (
        <div className="w-full flex justify-center bg-gray-50/50 min-h-screen">
            <div className="flex flex-col w-[1200px] gap-6 py-8 px-4">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="คะแนนต่ำสุด"
                        value={minScore}
                        icon={TrendingDown}
                        color="bg-red-50 text-red-600"
                    />
                    <StatCard
                        title="คะแนนสูงสุด"
                        value={maxScore}
                        icon={TrendingUp}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        title="คะแนนเฉลี่ย"
                        value={avgScore}
                        icon={BarChart3}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="ส่วนเบี่ยงเบนมาตรฐาน"
                        value={sdScore}
                        icon={Activity}
                        color="bg-purple-50 text-purple-600"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <ExportGradesButton students={students} assignments={assignments} classroomName={classroomName} />
                    </div>
                    {students.length > 0 || assignments.length > 0 ? (
                        <GradeTable assignments={assignments} students={students} />
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                            ยังไม่มีข้อมูลการให้คะแนน
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}