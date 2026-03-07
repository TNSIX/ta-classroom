"use client";

import { useState, useTransition } from "react";
import AssignmentWorksTable, { Work } from "@/components/classroom/assignment/assignment-works-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { saveGrades } from "@/app/actions/grade";

interface AssignmentWorksClientProps {
    classroomId: string;
    assignmentId: string;
    totalScore: number | null;
    initialWorks: Work[];
}

export default function AssignmentWorksClient({ classroomId, assignmentId, totalScore, initialWorks }: AssignmentWorksClientProps) {
    const [works, setWorks] = useState<Work[]>(initialWorks);
    const [savedWorks, setSavedWorks] = useState<Work[]>(initialWorks);
    const [isPending, startTransition] = useTransition();

    const hasChanges = JSON.stringify(works) !== JSON.stringify(savedWorks);

    const handleScoreChange = (id: string, newScore: number | null) => {
        setWorks(prev => prev.map(w => w.id === id ? { ...w, score: newScore } : w));
    };

    const handleReset = () => {
        setWorks(JSON.parse(JSON.stringify(savedWorks)));
    };

    const handleSave = () => {
        startTransition(async () => {
            const gradesData = works.map(w => ({ studentId: w.id, score: w.score }));
            const result = await saveGrades(classroomId, assignmentId, gradesData);

            if (result.error) {
                alert(result.error);
                return;
            }

            alert('บันทึกคะแนนสำเร็จ');
            setSavedWorks(JSON.parse(JSON.stringify(works)));
        });
    };

    const submittedCount = works.filter(w => ['submitted', 'late', 'graded', 'assigned'].includes(w.status)).length;
    const totalCount = works.length;

    return (
        <div className="flex flex-col w-[1200px] mb-12">
            <div className="flex items-end gap-2 justify-center mt-12 mb-12">
                <h1 className="text-2xl">ส่งแล้ว</h1>
                <h1 className="text-6xl font-bold text-blue-600">{submittedCount}</h1>
                <h3 className="text-2xl ">/</h3>
                <h1 className="text-2xl ">{totalCount}</h1>
            </div>

            <div className="flex justify-between mb-4">
                <Link href={`/classroom/${classroomId}/assignment/${assignmentId}/assignment_all`}>
                    <Button variant="ghost" className="group text-blue-600 hover:text-blue-700 hover:bg-transparent px-0">
                        ดูรายละเอียดงานทั้งหมด <ArrowRight className="group-hover:translate-x-1 transition-transform ml-2" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="text-gray-700 border-gray-300"
                        onClick={handleReset}
                        disabled={!hasChanges || isPending}
                    >
                        รีเซ็ต
                    </Button>
                    <Button
                        variant="outline"
                        className={`transition-all ${hasChanges
                            ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white"
                            : "bg-gray-100 text-gray-400"
                            }`}
                        onClick={handleSave}
                        disabled={!hasChanges || isPending}
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        บันทึก
                    </Button>
                </div>
            </div>

            <AssignmentWorksTable
                totalScore={totalScore}
                works={works}
                onScoreChange={handleScoreChange}
                isPending={isPending}
            />
        </div>
    );
}
