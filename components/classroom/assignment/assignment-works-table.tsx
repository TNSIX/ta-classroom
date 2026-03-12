import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface Work {
    id: string;
    name: string;
    avatar: string;
    status: string;
    submittedAt: string | null;
    workFile: string | null;
    score: number | null;
}

interface AssignmentWorksTableProps {
    totalScore?: number | null;
    works: Work[];
    onScoreChange: (id: string, score: number | null) => void;
    isPending?: boolean;
}

export default function AssignmentWorksTable({ totalScore = 10, works, onScoreChange, isPending = false }: AssignmentWorksTableProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "graded": return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
            case "submitted": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "late": return <Clock className="w-4 h-4 text-orange-500" />;
            case "missing": return <AlertCircle className="w-4 h-4 text-red-500" />;
            case "assigned": return <div className="w-4 h-4 rounded-full border border-gray-300" />;
            default: return <div className="w-4 h-4 rounded-full border border-gray-300" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "graded": return "ตรวจแล้ว";
            case "submitted": return "ส่งแล้ว";
            case "late": return "ส่งช้า";
            case "missing": return "ยังไม่ส่ง";
            case "assigned": return "มอบหมายแล้ว";
            default: return "";
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "graded": return "bg-purple-50 text-purple-700";
            case "submitted": return "bg-green-50 text-green-700";
            case "late": return "bg-orange-50 text-orange-700";
            case "missing": return "bg-red-50 text-red-700";
            case "assigned": return "bg-gray-50 text-gray-500";
            default: return "bg-gray-50 text-gray-500";
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="text-md">ชื่อ - นามสกุล</TableHead>
                            <TableHead className="text-md">สถานะ</TableHead>
                            <TableHead className="text-md">วันที่ส่ง</TableHead>
                            <TableHead className="text-md">คะแนน</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {works.map((work) => (
                            <TableRow key={work.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={work.avatar} />
                                            <AvatarFallback className="text-md">{work.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-md">{work.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
                                        getStatusClass(work.status)
                                    )}>
                                        {getStatusIcon(work.status)}
                                        <span>{getStatusText(work.status)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500 text-md">
                                    {work.submittedAt || "-"}
                                </TableCell>
                                <TableCell className="text-md">
                                    {totalScore !== null ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                className="w-16 text-center remove-arrow"
                                                value={work.score !== null ? work.score : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    let num = val === "" ? null : Number(val);
                                                    if (num !== null && num > totalScore) {
                                                        num = totalScore;
                                                    }
                                                    onScoreChange(work.id, num);
                                                }}
                                                placeholder="-"
                                                max={totalScore}
                                                min={0}
                                                disabled={isPending}
                                            />
                                            <span className="text-gray-400">/ {totalScore}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">ไม่มีคะแนน</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
