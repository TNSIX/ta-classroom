"use client";

import { useState, useEffect, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    FileText,
    Download,
    User,
    Search,
    File as FileIcon,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { saveGrades } from "@/app/actions/grade";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface FileItem {
    id: string;
    name: string;
    type: "pdf" | "image" | "doc" | "txt" | "other";
    url: string;
    size: string;
}

export interface Student {
    id: string;
    name: string;
    avatar: string;
    status: "submitted" | "late" | "missing" | "assigned" | "graded";
    submittedAt: string | null;
    files: FileItem[];
    score: number | null;
}

interface AssignmentAllClientProps {
    classroomId: string;
    assignmentId: string;
    totalScore: number;
    initialStudents: Student[];
}

export default function AssignmentAllClient({ classroomId, assignmentId, totalScore, initialStudents }: AssignmentAllClientProps) {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [savedStudents, setSavedStudents] = useState<Student[]>(initialStudents);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudents.length > 0 ? initialStudents[0].id : null);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    const hasChanges = JSON.stringify(students) !== JSON.stringify(savedStudents);

    const handleScoreChange = (id: string, newScore: number | null) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, score: newScore } : s));
    };

    const handleReset = () => {
        setStudents(JSON.parse(JSON.stringify(savedStudents)));
    };

    const handleSave = () => {
        startTransition(async () => {
            const gradesData = students.map(s => ({ studentId: s.id, score: s.score }));
            const result = await saveGrades(classroomId, assignmentId, gradesData);

            if (result.error) {
                alert(result.error);
                return;
            }

            alert('บันทึกคะแนนสำเร็จ');
            setSavedStudents(JSON.parse(JSON.stringify(students)));

            // Re-sync submission statuses locally to 'graded' if a score is applied and wasn't before
            const updatedStudents = students.map(s => {
                let newStatus = s.status;
                if (s.score !== null) {
                    newStatus = 'graded';
                }
                return { ...s, status: newStatus };
            });
            setStudents(JSON.parse(JSON.stringify(updatedStudents)));
            setSavedStudents(JSON.parse(JSON.stringify(updatedStudents)));
        });
    };

    // Initialize selected file when student changes
    useEffect(() => {
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student && student.files.length > 0) {
                setSelectedFileId(student.files[0].id);
            } else {
                setSelectedFileId(null);
            }
        }
    }, [selectedStudentId, students]);

    const selectedStudent = students.find(s => s.id === selectedStudentId);
    const selectedFile = selectedStudent?.files.find(f => f.id === selectedFileId);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Action Bar Above (Link Back to Assignment Works) */}
            <div className="flex bg-white px-4 py-2 border-b items-center gap-4">
                <Link href={`/classroom/${classroomId}/assignment/${assignmentId}/assignment_works`}>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับหน้ารวมงาน
                    </Button>
                </Link>
                <div className="text-sm text-gray-500 ml-auto">
                    คะแนนเต็ม: {totalScore} คะแนน
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Column 1: Student List */}
                <div className="w-full md:w-96 border-r md:border-r-0 border-b md:border-b-0 md:border-r flex flex-col bg-white z-10 shadow-sm shrink-0 h-[300px] md:h-auto">
                    <div className="p-2 border-b flex justify-between items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="ค้นหาชื่อนักเรียน"
                                className="pl-9 h-9 bg-gray-50 text-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="p-2 border-b flex justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-md h-8 px-2 flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={handleReset}
                            disabled={!hasChanges || isPending}
                        >
                            รีเซ็ต
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "text-md h-8 px-2 flex-1 transition-all",
                                hasChanges
                                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:text-white"
                                    : "bg-gray-100 text-gray-400"
                            )}
                            onClick={handleSave}
                            disabled={!hasChanges || isPending}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            บันทึกคะแนน
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="divide-y">
                            {filteredStudents.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={cn(
                                        "w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b",
                                        selectedStudentId === student.id && "bg-blue-50 hover:bg-blue-50"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={student.avatar} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className={cn(
                                            "font-medium truncate",
                                            selectedStudentId === student.id ? "text-blue-700" : "text-gray-900"
                                        )}>
                                            {student.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {getStatusIcon(student.status)}
                                            <span className="text-sm text-gray-500">{getStatusText(student.status)}</span>
                                            {student.submittedAt && (
                                                <span className="text-xs text-gray-400 ml-1">({student.submittedAt})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mr-4" onClick={(e) => e.stopPropagation()}>
                                        <Input
                                            type="number"
                                            className="w-12 h-8 text-center px-1 text-md remove-arrow bg-white focus:bg-white"
                                            value={student.score !== null ? student.score : ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                let num = val === "" ? null : Number(val);
                                                if (num !== null && totalScore && num > totalScore) {
                                                    num = totalScore;
                                                }
                                                handleScoreChange(student.id, num);
                                            }}
                                            placeholder="-"
                                            max={totalScore}
                                            disabled={isPending}
                                        />
                                        <span className="text-md text-gray-400 w-3">/{totalScore || '-'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Column 2: File List */}
                <div className="w-full md:w-72 border-r md:border-r-0 border-b md:border-b-0 md:border-r flex flex-col bg-gray-50 shrink-0 h-[250px] md:h-auto">
                    <ScrollArea className="flex-1 p-3">
                        {!selectedStudent ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <User className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-sm">เลือกนักเรียนทางซ้ายเพื่อตรวจงาน</span>
                            </div>
                        ) : selectedStudent.files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 mt-10">
                                <FileIcon className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-sm">นักเรียนไม่ได้แนบไฟล์</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedStudent.files.map((file) => (
                                    <button
                                        key={file.id}
                                        onClick={() => setSelectedFileId(file.id)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm flex items-start gap-3",
                                            selectedFileId === file.id
                                                ? "bg-white border-blue-400 shadow-sm ring-1 ring-blue-100"
                                                : "bg-white border-gray-200 hover:border-blue-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-md",
                                            file.type === 'pdf' ? "bg-red-50 text-red-500" :
                                                file.type === 'txt' ? "bg-green-50 text-green-600" :
                                                    "bg-blue-50 text-blue-500"
                                        )}>
                                            {file.type === 'pdf' || file.type === 'txt' ? <FileText className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate mb-1" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {file.size}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Column 3: File Preview (Main Area) */}
                <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden relative">
                    {selectedFile ? (
                        <>
                            <div className="h-[60px] bg-white border-b flex items-center justify-between px-6 z-10 w-full overflow-hidden shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-1.5 bg-gray-100 rounded text-gray-600 shrink-0">
                                        {selectedFile.type === 'pdf' || selectedFile.type === 'txt' ? <FileText className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                                    </div>
                                    <span className="font-medium text-gray-800 truncate" title={selectedFile.name}>{selectedFile.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <a href={selectedFile.url} download={selectedFile.name} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="w-4 h-4" />
                                            ดาวน์โหลด
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                                {selectedFile.type === 'pdf' ? (
                                    <div className="w-full h-full max-w-5xl bg-white shadow-lg rounded-sm overflow-hidden border border-gray-200">
                                        <iframe
                                            src={`${selectedFile.url}#toolbar=0`}
                                            className="w-full h-full"
                                            title="PDF Preview"
                                        />
                                    </div>
                                ) : selectedFile.type === 'image' ? (
                                    <div className="w-full h-full max-w-5xl flex items-center justify-center bg-gray-900/5 rounded-lg overflow-hidden p-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={selectedFile.url}
                                            alt={selectedFile.name}
                                            className="max-w-full max-h-full object-contain shadow-md rounded border border-gray-200 bg-white"
                                        />
                                    </div>
                                ) : selectedFile.type === 'txt' ? (
                                    <div className="w-full h-full max-w-5xl bg-white shadow-lg rounded-sm overflow-hidden border border-gray-200 flex flex-col">
                                        <iframe
                                            src={selectedFile.url}
                                            className="w-full flex-1"
                                            title="Text Preview"
                                            style={{ backgroundColor: 'white' }}
                                        />
                                    </div>
                                ) : selectedFile.type === 'doc' ? (
                                    <div className="w-full h-full max-w-5xl bg-white shadow-lg rounded-sm overflow-hidden border border-gray-200">
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFile.url)}`}
                                            className="w-full h-full"
                                            title="Office Document Preview"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl shadow-sm max-w-md w-full border">
                                        <div className="bg-blue-50 p-6 rounded-full mb-6">
                                            <FileIcon className="w-16 h-16 text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate max-w-full" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </h3>
                                        <p className="text-gray-500 mb-8 max-w-[260px]">
                                            ไฟล์ประเภทนี้ไม่สามารถแสดงตัวอย่างได้ กรุณาดาวน์โหลดเพื่อเปิดดู
                                        </p>
                                        <a href={selectedFile.url} download={selectedFile.name} target="_blank" rel="noreferrer">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                <Download className="w-4 h-4 mr-2" />
                                                ดาวน์โหลดไฟล์ ({selectedFile.size})
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-200 p-8 rounded-full mb-4 opacity-50">
                                <FileIcon className="w-16 h-16" />
                            </div>
                            <p className="text-lg font-medium">ไม่มีการระบุไฟล์</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

