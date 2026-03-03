import ClassroomID from "@/components/classroom/classroom-id";
import ClassroomStatus from "@/components/classroom/classroom-status";
import ExportGradesButton from "@/components/classroom/grade/export-grades-button";
import GradeTable from "@/components/classroom/grade/grade-table";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function GradePage() {
    // Mock Data
    const assignments = [
        { id: 1, name: "การบ้าน 1", maxScore: 10 },
        { id: 2, name: "การบ้าน 2", maxScore: 10 },
        { id: 3, name: "Lab 1", maxScore: 20 },
        { id: 4, name: "Lab 2", maxScore: 20 },
        { id: 5, name: "Quiz 1", maxScore: 10 },
        { id: 6, name: "Quiz 2", maxScore: 10 },
        { id: 7, name: "Project", maxScore: 50 },
        { id: 8, name: "สอบกลางภาค", maxScore: 30 },
        { id: 9, name: "สอบปลายภาค", maxScore: 40 },
        { id: 10, name: "สอบปลายภาค", maxScore: 40 },
        { id: 11, name: "สอบปลายภาค", maxScore: 40 },
        { id: 12, name: "สอบปลายภาค", maxScore: 40 },
        { id: 13, name: "สอบปลายภาค", maxScore: 40 },
        { id: 14, name: "สอบปลายภาค", maxScore: 40 },
        { id: 15, name: "สอบปลายภาค", maxScore: 40 },
        { id: 16, name: "สอบปลายภาค", maxScore: 40 },
        { id: 17, name: "สอบปลายภาค", maxScore: 40 },
        { id: 18, name: "สอบปลายภาค", maxScore: 40 },
        { id: 19, name: "สอบปลายภาค", maxScore: 40 },
        { id: 20, name: "สอบปลายภาค", maxScore: 40 },
    ];

    const students = [
        { id: 1, name: "สมชาย แซ่ลี้", scores: { 1: 9, 2: 10, 3: 18, 4: 19, 5: 9, 6: 8, 7: 45, 8: 25, 9: 35 } },
        { id: 2, name: "สมหญิง ใจดี", scores: { 1: 10, 2: 9, 3: 20, 4: 20, 5: 10, 6: 10, 7: 48, 8: 28, 9: 38 } },
        { id: 3, name: "จอห์น โด", scores: { 1: 7, 2: 8, 3: 15, 4: 16, 5: 7, 6: 6, 7: 40, 8: 20, 9: 30 } },
        { id: 4, name: "เจน สมิธ", scores: { 1: 10, 2: 10, 3: 19, 4: 19, 5: 9, 6: 9, 7: 46, 8: 29, 9: 39 } },
        { id: 5, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 6, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 7, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 8, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 9, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 10, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 11, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 12, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 13, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 14, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 15, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 16, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 17, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 18, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 19, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
        { id: 20, name: "ทอม ครูซ", scores: { 1: 8, 2: 9, 3: 17, 4: 18, 5: 8, 6: 8, 7: 42, 8: 24, 9: 34 } },
    ];

    // Calculate Statistics
    const studentTotals = students.map(student =>
        assignments.reduce((acc, curr) => acc + ((student.scores as Record<number, number>)[curr.id] || 0), 0)
    );

    const minScore = Math.min(...studentTotals);
    const maxScore = Math.max(...studentTotals);
    const sumScore = studentTotals.reduce((a, b) => a + b, 0);
    const avgScore = sumScore / studentTotals.length;

    // Variance and SD
    const variance = studentTotals.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / studentTotals.length;
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
                        <ExportGradesButton students={students} assignments={assignments} classroomName="วิศวกรรมซอฟต์แวร์_CS101" />
                    </div>
                    <GradeTable assignments={assignments} students={students} />
                </div>
            </div>
        </div>
    );
}