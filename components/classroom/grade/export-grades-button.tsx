"use client";

import { Download } from 'lucide-react';

interface ExportGradesButtonProps {
    students: any[];
    assignments: any[];
    classroomName?: string;
}

export default function ExportGradesButton({ students, assignments, classroomName = "Classroom" }: ExportGradesButtonProps) {
    const handleExport = () => {
        // Prepare CSV headers
        const headers = ["ชื่อ-นามสกุล", ...assignments.map(a => a.name), "คะแนนรวม"];

        // Prepare CSV rows
        const rows = students.map(student => {
            const scores = assignments.map(a => student.scores[a.id] || 0);
            const total = scores.reduce((acc, score) => acc + score, 0);

            const rowData = [
                `"${student.name}"`, // Quote name in case it contains commas
                ...scores,
                total
            ];
            return rowData.join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");

        // Add BOM for UTF-8 encoding support in Excel
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        const safeClassName = classroomName.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
        link.download = `grades_export_${safeClassName}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#2a68ff] hover:bg-blue-700 text-white py-2 px-4 rounded-lg justify-center shadow-sm transition-colors"
        >
            <Download size={18} />
            <span className="font-medium text-sm">ส่งออก .csv</span>
        </button>
    );
}
