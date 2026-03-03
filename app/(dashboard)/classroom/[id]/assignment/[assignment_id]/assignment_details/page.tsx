"use client";

import { MoreVertical, FileText, Pencil, Trash, Paperclip, X, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FileAttachment from "@/components/classroom/assignment/file-attachment";

export type Role = "creator" | "manager" | "member";

export default function AssignmentDetailPage() {
    const [role, setRole] = useState<Role | null>(null);

    // จำลองการดึงบทบาทของผู้ใช้งานจากฐานข้อมูล
    useEffect(() => {
        const fetchRole = async () => {
            // หน่วงเวลาเล็กน้อยเพื่อจำลองการรอผลจากฐานข้อมูล
            await new Promise(resolve => setTimeout(resolve, 500));

            // จำลองค่าจำลองที่ได้รับหลัง Query Database
            // สามารถเปลี่ยนเป็น "creator", "manager", ฯลฯ ได้เพื่อดูผลลัพธ์
            const roleFromDB: Role = "member";
            setRole(roleFromDB);
        };

        fetchRole();
    }, []);

    const initialFiles = [
        { name: "ใบงานที่_1.pdf", size: 1.5 * 1024 * 1024, type: "PDF" },
        { name: "ตัวอย่างโค้ด.zip", size: 4.2 * 1024 * 1024, type: "ZIP" },
        { name: "สไลด์ประกอบการสอน.pptx", size: 2.8 * 1024 * 1024, type: "PPTX" },
        { name: "รูปประกอบ.png", size: 850 * 1024, type: "PNG" }
    ];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [title, setTitle] = useState("Practice ครั้งที่ 3");
    const [dueDate, setDueDate] = useState("2025-09-03");
    const [dueTime, setDueTime] = useState("23:59");
    const [score, setScore] = useState("10");
    const [description, setDescription] = useState("ให้นักศึกษาทำ Practice ครั้งที่ 3 และส่งงานภายในกำหนด");
    const [files, setFiles] = useState<any[]>(initialFiles);

    const [editTitle, setEditTitle] = useState(title);
    const [editDueDate, setEditDueDate] = useState(dueDate);
    const [editDueTime, setEditDueTime] = useState(dueTime);
    const [editScore, setEditScore] = useState(score);
    const [editDescription, setEditDescription] = useState(description);
    const [editFiles, setEditFiles] = useState<any[]>(files);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const submitFileInputRef = useRef<HTMLInputElement>(null);

    const [submittedFiles, setSubmittedFiles] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmitSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                name: f.name,
                size: f.size,
                type: f.name.split('.').pop()?.toUpperCase() || "FILE"
            }));
            setSubmittedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeSubmittedFile = (indexToRemove: number) => {
        setSubmittedFiles(submittedFiles.filter((_, index) => index !== indexToRemove));
    };

    const formatSize = (bytes: number) => {
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        return (bytes / 1024).toFixed(0) + " KB";
    };

    const formatDate = (dateString: string, timeString: string) => {
        if (!dateString) return "ไม่มีกำหนด";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return `กำหนดส่งวันที่ ${dateString} ${timeString} น.`;
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        return `กำหนดส่งก่อนวันที่ ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543} ${timeString} น.`;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                name: f.name,
                size: f.size,
                type: f.name.split('.').pop()?.toUpperCase() || "FILE"
            }));
            setEditFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setEditFiles(editFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleEditClick = (e: Event) => {
        e.stopPropagation();
        setEditTitle(title);
        setEditDueDate(dueDate);
        setEditDueTime(dueTime);
        setEditScore(score);
        setEditDescription(description);
        setEditFiles(files);
        setIsEditOpen(true);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTitle(editTitle);
        setDueDate(editDueDate);
        setDueTime(editDueTime);
        setScore(editScore);
        setDescription(editDescription);
        setFiles(editFiles);
        setIsEditOpen(false);
    };
    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditOpen(false);
    };

    if (!role) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-gray-500 animate-pulse text-lg font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full">
            <div className="w-full max-w-[1200px] mt-8 flex flex-col md:flex-row gap-6 items-start px-4">
                <div className="flex-1 min-w-0">
                    {/* Header Section */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                        <div className="space-y-1">
                            <h1 className="text-2xl text-blue-600">{title}</h1>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>ชื่อ นามสกุล</span>
                                <span>•</span>
                                <span>โพสต์วันที่ 18 ส.ค. 2568 13:23 น.</span>
                                <span className="mx-1">|</span>
                                <span className="font-medium">{formatDate(dueDate, dueTime)}</span>
                            </div>
                        </div>
                        {role !== "member" && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 hover:bg-transparent rounded-full">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="p-2 space-y-1">
                                        <DropdownMenuItem onSelect={handleEditClick} className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200">
                                            <Pencil className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                            <span>แก้ไข</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200">
                                            <Trash className="h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                            <span>ลบ</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="mt-4 space-y-4">
                        <p className="text-md text-gray-800 whitespace-pre-wrap break-words">
                            {description}
                        </p>

                        {/* แสดงไฟล์แนบ */}
                        {files.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {files.map((file, idx) => (
                                    <FileAttachment
                                        key={idx}
                                        fileName={file.name}
                                        fileSize={formatSize(file.size)}
                                        fileType={file.type}
                                    />

                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {role === "member" && (
                    <div className="w-full md:w-[320px] shrink-0">
                        <Card className="p-4 rounded-xl shadow-none border bg-white">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium text-blue-600">งานของคุณ</h2>
                            </div>

                            {submittedFiles.length > 0 && (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {submittedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-2 rounded-md">
                                            <div className="flex items-center space-x-2 overflow-hidden">
                                                <FileIcon className="h-4 w-4 text-gray-500 shrink-0" />
                                                <span className="text-sm truncate text-gray-700">{file.name}</span>
                                            </div>
                                            {!isSubmitted && (
                                                <button onClick={() => removeSubmittedFile(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                {!isSubmitted && (
                                    <>
                                        <input
                                            type="file"
                                            ref={submitFileInputRef}
                                            className="hidden"
                                            multiple
                                            onChange={handleSubmitSelect}
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full text-blue-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white font-medium"
                                            onClick={() => submitFileInputRef.current?.click()}
                                        >
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            เพิ่มไฟล์
                                        </Button>
                                    </>
                                )}

                                <Button
                                    onClick={() => setIsSubmitted(!isSubmitted)}
                                    className={`w-full font-medium transition-colors ${isSubmitted || submittedFiles.length > 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    {isSubmitted ? "ยกเลิกการเสร็จสิ้น" : submittedFiles.length > 0 ? "ส่งงานเลย" : "ทำเครื่องหมายว่าเสร็จสิ้น"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-blue-600">แก้ไขงาน</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 overflow-y-auto pr-2 py-4">
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="title" className="text-gray-700">
                                        ชื่องาน <span className="text-red-500">*</span>
                                    </Label>
                                    <span className="text-xs text-muted-foreground">{editTitle.length}/100</span>
                                </div>
                                <Input
                                    id="title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="ระบุชื่องาน..."
                                    maxLength={100}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate" className="text-gray-700">
                                        วันที่ส่ง
                                    </Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueTime" className="text-gray-700">
                                        เวลาส่ง
                                    </Label>
                                    <Input
                                        id="dueTime"
                                        type="time"
                                        value={editDueTime}
                                        onChange={(e) => setEditDueTime(e.target.value)}
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="score" className="text-gray-700">
                                        คะแนน
                                    </Label>
                                    <Input
                                        id="score"
                                        type="number"
                                        min="0"
                                        value={editScore}
                                        onChange={(e) => setEditScore(e.target.value)}
                                        placeholder="ระบุคะแนน..."
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-gray-700">
                                    รายละเอียด
                                </Label>
                                <Textarea
                                    id="description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="พิมพ์รายละเอียดงานที่นี่..."
                                    className="min-h-[150px] resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-dashed border-gray-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    แนบไฟล์ประกอบ
                                </Button>

                                {/* Selected Files List */}
                                {editFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {editFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                                <div className="flex items-center text-gray-700 truncate">
                                                    <FileIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                                                    <span className="truncate max-w-[400px]">{file.name}</span>
                                                    <span className="ml-2 text-xs text-gray-400">({formatSize(file.size)})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile(index);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" className="text-gray-500 hover:text-gray-700 mr-4" onClick={handleCancel}>
                                ยกเลิก
                            </Button>
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={!editTitle.trim()}
                                onClick={handleSave}
                            >
                                บันทึก
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
