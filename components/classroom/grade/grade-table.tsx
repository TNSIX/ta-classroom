import { User } from "lucide-react";

interface GradeTableProps {
    assignments: any[];
    students: any[];
}

export default function GradeTable({ assignments, students }: GradeTableProps) {
    // คำนวณคะแนนเต็มรวมทุกงาน
    const totalMaxScore = assignments.reduce((acc, curr) => acc + (curr.maxScore || 0), 0);

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-md text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                        <tr>
                            <th className="px-6 py-4 font-medium whitespace-nowrap sticky left-0 bg-gray-50 z-10 w-[200px]">
                                รายชื่อนักเรียน
                            </th>
                            {assignments.map((assignment) => (
                                <th key={assignment.id} className="px-6 py-4 font-medium text-center whitespace-nowrap min-w-[120px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-800">{assignment.name}</span>
                                        <span className="text-sm text-gray-500 font-normal">({assignment.maxScore} คะแนน)</span>
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-4 font-medium text-center whitespace-nowrap min-w-[120px] bg-gray-50 sticky right-0 z-10 border-l border-gray-200">
                                <div className="flex flex-col items-center">
                                    <span className="text-gray-800">รวม</span>
                                    <span className="text-xs text-gray-500 font-normal">({totalMaxScore} คะแนน)</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => {
                            const totalScore = assignments.reduce((acc, curr) => acc + (student.scores[curr.id] || 0), 0);
                            const totalMax = assignments.reduce((acc, curr) => acc + curr.maxScore, 0);
                            const percentage = Math.round((totalScore / totalMax) * 100);

                            return (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3 sticky left-0 bg-white group-hover:bg-gray-50 whitespace-nowrap z-10 border-r border-transparent">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <User size={16} />
                                        </div>
                                        {student.name}
                                    </td>
                                    {assignments.map((assignment) => (
                                        <td key={assignment.id} className="px-6 py-4 text-center text-gray-800">
                                            {student.scores[assignment.id] ?? "-"}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center font-semibold text-blue-600 sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
                                        {totalScore} / {totalMax}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination placeholder */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
                <span>แสดง {students.length} รายชื่อ</span>
                <div className="flex gap-2">
                    {/* Placeholder for pagination if needed */}
                </div>
            </div>
        </div>
    );
}
