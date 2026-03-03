"use client";

import { useState } from "react";
import AssignmentWorksTable, { Work } from "@/components/classroom/assignment/assignment-works-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

const MOCK_WORKS: Work[] = [
    {
        id: "1",
        name: "นายสมชาย เรียนเก่ง",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 10:30",
        workFile: "assignment_somchai.pdf",
        score: null,
    },
    {
        id: "2",
        name: "นางสาวสมหญิง ตั้งใจ",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 11:15",
        workFile: "report_final.docx",
        score: 8,
    },
    {
        id: "3",
        name: "นายมานี มีมานะ",
        avatar: "",
        status: "late",
        submittedAt: "11 ต.ค. 2023 09:00",
        workFile: "homework_manee.pdf",
        score: null,
    },
    {
        id: "4",
        name: "นายปิติ ชูใจ",
        avatar: "",
        status: "missing",
        submittedAt: null,
        workFile: null,
        score: null,
    },
    {
        id: "5",
        name: "นายชูใจ รักดี",
        avatar: "",
        status: "assigned",
        submittedAt: null,
        workFile: null,
        score: null,
    },
    {
        id: "6",
        name: "นายสมชาย เรียนเก่ง",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 10:30",
        workFile: "assignment_somchai.pdf",
        score: null,
    },
    {
        id: "7",
        name: "นางสาวสมหญิง ตั้งใจ",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 11:15",
        workFile: "report_final.docx",
        score: 8,
    },
    {
        id: "8",
        name: "นายมานี มีมานะ",
        avatar: "",
        status: "late",
        submittedAt: "11 ต.ค. 2023 09:00",
        workFile: "homework_manee.pdf",
        score: null,
    },
    {
        id: "9",
        name: "นายปิติ ชูใจ",
        avatar: "",
        status: "missing",
        submittedAt: null,
        workFile: null,
        score: null,
    },
    {
        id: "10",
        name: "นายชูใจ รักดี",
        avatar: "",
        status: "assigned",
        submittedAt: null,
        workFile: null,
        score: null,
    },
    {
        id: "11",
        name: "นายสมชาย เรียนเก่ง",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 10:30",
        workFile: "assignment_somchai.pdf",
        score: null,
    },
    {
        id: "12",
        name: "นางสาวสมหญิง ตั้งใจ",
        avatar: "",
        status: "submitted",
        submittedAt: "10 ต.ค. 2023 11:15",
        workFile: "report_final.docx",
        score: 8,
    },
    {
        id: "13",
        name: "นายมานี มีมานะ",
        avatar: "",
        status: "late",
        submittedAt: "11 ต.ค. 2023 09:00",
        workFile: "homework_manee.pdf",
        score: null,
    },
    {
        id: "14",
        name: "นายปิติ ชูใจ",
        avatar: "",
        status: "missing",
        submittedAt: null,
        workFile: null,
        score: null,
    },
    {
        id: "15",
        name: "นายชูใจ รักดี",
        avatar: "",
        status: "assigned",
        submittedAt: null,
        workFile: null,
        score: null,
    },
];


export default function AssignmentWorksPage() {
    const params = useParams();
    const [works, setWorks] = useState<Work[]>(MOCK_WORKS);
    const [savedWorks, setSavedWorks] = useState<Work[]>(MOCK_WORKS);

    const hasChanges = JSON.stringify(works) !== JSON.stringify(savedWorks);

    const handleScoreChange = (id: string, newScore: number | null) => {
        setWorks(prev => prev.map(w => w.id === id ? { ...w, score: newScore } : w));
    };

    const handleReset = () => {
        setWorks(JSON.parse(JSON.stringify(savedWorks)));
    };

    const handleSave = () => {
        setSavedWorks(JSON.parse(JSON.stringify(works)));
        // In a real app, you would save to the backend here
    };

    const submittedCount = works.filter(w => w.status === "submitted" || w.status === "late").length;
    const totalCount = works.length;

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-col w-[1200px] mb-12">

                <div className="flex items-end gap-2 justify-center mt-12 mb-12">
                    <h1 className="text-2xl">ส่งแล้ว</h1>
                    <h1 className="text-6xl font-bold text-blue-600">{submittedCount}</h1>
                    <h3 className="text-2xl ">/</h3>
                    <h1 className="text-2xl ">{totalCount}</h1>
                </div>

                <div className="flex justify-between mb-4">
                    <Link href={`/classroom/${params.id}/assignment/${params.assignment_id}/assignment_all`}>
                        <Button variant="ghost" className="group text-blue-600 hover:text-blue-700 hover:bg-transparent">
                            ดูรายละเอียดงานทั้งหมด <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="text-gray-700 border-gray-300"
                            onClick={handleReset}
                            disabled={!hasChanges}
                        >
                            รีเซ็ต
                        </Button>
                        <Button
                            variant="outline"
                            className={`
                                transition-all
                                ${hasChanges
                                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white"
                                    : "bg-gray-100 text-gray-400"
                                }
                            `}
                            onClick={handleSave}
                            disabled={!hasChanges}
                        >
                            บันทึก
                        </Button>
                    </div>

                </div>

                <AssignmentWorksTable
                    works={works}
                    onScoreChange={handleScoreChange}
                />
            </div>
        </div>
    );
}
