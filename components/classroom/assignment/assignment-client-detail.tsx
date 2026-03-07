"use client";

import { MoreVertical, Pencil, Trash, Paperclip, X, File as FileIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";
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
import StudentSubmission from "@/components/classroom/assignment/student-submission";
import { editAssignment, deleteAssignment } from "@/app/actions/assignment";
import { useRouter } from "next/navigation";

export type Role = "creator" | "manager" | "student";

interface AssignmentClientDetailProps {
    classroomId: string;
    assignmentId: string;
    role: Role;
    assignment: {
        title: string;
        description: string;
        dueDate: string | null;
        dueTime: string | null;
        score: number;
        created_at: string;
        creator_name: string;
        files?: any[];
    };
    studentSubmission?: {
        status: string | null;
        files: any[];
    };
}

export default function AssignmentClientDetail({ classroomId, assignmentId, role, assignment, studentSubmission }: AssignmentClientDetailProps) {
    const router = useRouter();
    const initialFiles = assignment.files || [];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editStatus, setEditStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // States matching DB values
    const [title, setTitle] = useState(assignment.title);
    const [dueDate, setDueDate] = useState(assignment.dueDate || "");
    const [dueTime, setDueTime] = useState(assignment.dueTime || "");
    const [score, setScore] = useState(assignment.score.toString());
    const [description, setDescription] = useState(assignment.description || "");
    const [files, setFiles] = useState<any[]>(initialFiles);

    // Edit states
    const [editTitle, setEditTitle] = useState(title);
    const [editDueDate, setEditDueDate] = useState(dueDate);
    const [editDueTime, setEditDueTime] = useState(dueTime);
    const [editScore, setEditScore] = useState(score);
    const [editDescription, setEditDescription] = useState(description);
    // แยกไฟล์ออกเป็น 2 ประเภท
    const [editExistingFiles, setEditExistingFiles] = useState<any[]>(initialFiles); // ไฟล์เดิมจาก DB (มี id)
    const [editNewFiles, setEditNewFiles] = useState<File[]>([]);                   // ไฟล์ใหม่ที่อยู่ใน memory
    const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);             // IDs ที่ถูกลบ

    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 KB";
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

    const formatCreatedDate = (isoString: string) => {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "ไม่ทราบเวลาโพสต์";
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear() + 543;
        const time = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
        return `โพสต์วันที่ ${d} ${m} ${y} ${time} น.`;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEditNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeExistingFile = (fileId: string) => {
        setEditExistingFiles(prev => prev.filter(f => f.id !== fileId));
        setDeletedFileIds(prev => [...prev, fileId]);
    };

    const removeNewFile = (index: number) => {
        setEditNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ── Edit ──────────────────────────────────────────────
    const handleEditClick = (e: Event) => {
        e.stopPropagation();
        setEditTitle(title);
        setEditDueDate(dueDate);
        setEditDueTime(dueTime);
        setEditScore(score);
        setEditDescription(description);
        setEditExistingFiles(files); // reset เป็นไฟล์ปัจจุบัน
        setEditNewFiles([]);
        setDeletedFileIds([]);
        setEditStatus('idle');
        setIsEditOpen(true);
    };

    const handleEditOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) setTimeout(() => setEditStatus('idle'), 300);
    };

    const handleSave = async () => {
        if (!editTitle.trim()) return;
        setEditStatus('loading');
        const result = await editAssignment(
            assignmentId,
            classroomId,
            editTitle,
            editDescription,
            editDueDate,
            editDueTime,
            editScore || "100",
            deletedFileIds,
            editNewFiles
        );
        if (result?.error) {
            setEditStatus('error');
            setTimeout(() => setEditStatus('idle'), 2000);
            return;
        }
        setTitle(editTitle);
        setDescription(editDescription);
        setDueDate(editDueDate);
        setDueTime(editDueTime);
        setScore(editScore || "100");
        // อัปเดต files: ไฟล์ที่เหลือ + placeholder ไฟล์ใหม่
        const newFilePlaceholders = editNewFiles.map(f => ({ name: f.name, size: f.size, type: f.type || 'FILE' }));
        setFiles([...editExistingFiles, ...newFilePlaceholders]);
        setEditStatus('success');
        setTimeout(() => handleEditOpenChange(false), 1500);
    };

    // ── Delete ─────────────────────────────────────────────
    const handleDeleteClick = (e: Event) => {
        e.preventDefault();
        setDeleteStatus('idle');
        setIsDeleteOpen(true);
    };

    const handleDeleteOpenChange = (open: boolean) => {
        setIsDeleteOpen(open);
        if (!open) setTimeout(() => setDeleteStatus('idle'), 300);
    };

    const handleConfirmDelete = async () => {
        setDeleteStatus('loading');
        const result = await deleteAssignment(assignmentId, classroomId);
        if (result?.error) {
            setDeleteStatus('error');
            setTimeout(() => setDeleteStatus('idle'), 2000);
            return;
        }
        setDeleteStatus('success');
        setTimeout(() => {
            handleDeleteOpenChange(false);
            router.push(`/classroom/${classroomId}/assignment`);
        }, 1500);
    };

    return (
        <div className="flex justify-center w-full">
            <div className="w-full max-w-[1200px] mt-8 flex flex-col md:flex-row gap-6 items-start px-4">
                <div className="flex-1 min-w-0">
                    {/* Header Section */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                        <div className="space-y-1">
                            <h1 className="text-2xl text-blue-600">{title}</h1>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>{assignment.creator_name}</span>
                                <span>•</span>
                                <span>{formatCreatedDate(assignment.created_at)}</span>
                                <span className="mx-1">|</span>
                                <span className="font-medium">{formatDate(dueDate, dueTime || "23:59")}</span>
                            </div>
                        </div>
                        {role !== "student" && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 hover:bg-transparent rounded-full">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="p-2 space-y-1">
                                        <DropdownMenuItem onSelect={handleEditClick} className="p-2 transition-colors ease-in-out text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200">
                                            <Pencil className="h-4 w-4 focus:text-blue-600" />
                                            <span>แก้ไข</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleDeleteClick} className="p-2 transition-colors ease-in-out text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200">
                                            <Trash className="h-4 w-4 focus:text-red-600" />
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

                        {/* ไฟล์แนบงาน */}
                        {files.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {files.map((file, idx) => (
                                    <FileAttachment
                                        key={idx}
                                        fileName={file.name}
                                        fileSize={formatSize(file.size)}
                                        fileType={file.type}
                                        fileUrl={file.file_url}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {role === "student" && (
                    <StudentSubmission
                        classroomId={classroomId}
                        assignmentId={assignmentId}
                        initialStatus={studentSubmission?.status || null}
                        initialFiles={studentSubmission?.files || []}
                    />
                )}

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {editStatus === 'idle' && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-blue-600">แก้ไขงาน</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-6 overflow-y-auto pr-2 py-4">
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="edit-title" className="text-gray-700">
                                                ชื่องาน <span className="text-red-500">*</span>
                                            </Label>
                                            <span className="text-xs text-muted-foreground">{editTitle.length}/100</span>
                                        </div>
                                        <Input
                                            id="edit-title"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="ระบุชื่องาน..."
                                            maxLength={100}
                                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-dueDate" className="text-gray-700">วันที่ส่ง</Label>
                                            <Input
                                                id="edit-dueDate"
                                                type="date"
                                                value={editDueDate}
                                                onChange={(e) => setEditDueDate(e.target.value)}
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-dueTime" className="text-gray-700">เวลาส่ง</Label>
                                            <Input
                                                id="edit-dueTime"
                                                type="time"
                                                value={editDueTime}
                                                onChange={(e) => setEditDueTime(e.target.value)}
                                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-score" className="text-gray-700">คะแนนเต็ม</Label>
                                            <Input
                                                id="edit-score"
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
                                        <Label htmlFor="edit-description" className="text-gray-700">รายละเอียด</Label>
                                        <Textarea
                                            id="edit-description"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="พิมพ์รายละเอียดงานที่นี่..."
                                            className="min-h-[150px] resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-dashed border-gray-300"
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        >
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            แนบไฟล์ประกอบ
                                        </Button>

                                        {(editExistingFiles.length > 0 || editNewFiles.length > 0) && (
                                            <div className="mt-3 space-y-2">
                                                {editExistingFiles.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-blue-100">
                                                        <div className="flex items-center text-gray-700 truncate">
                                                            <FileIcon className="h-3 w-3 mr-2 flex-shrink-0 text-blue-500" />
                                                            <span className="truncate max-w-[400px]">{file.name}</span>
                                                            <span className="ml-2 text-xs text-gray-400">({formatSize(file.size)})</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeExistingFile(file.id); }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {editNewFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm bg-green-50 p-2 rounded border border-green-100">
                                                        <div className="flex items-center text-gray-700 truncate">
                                                            <FileIcon className="h-3 w-3 mr-2 flex-shrink-0 text-green-500" />
                                                            <span className="truncate max-w-[400px]">{file.name}</span>
                                                            <span className="ml-2 text-xs text-gray-400">({formatSize(file.size)})</span>
                                                            <span className="ml-2 text-xs text-green-500">ใหม่</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeNewFile(index); }}
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
                                    <Button variant="ghost" className="text-gray-500 hover:text-gray-700 mr-4" onClick={() => handleEditOpenChange(false)}>
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
                            </>
                        )}

                        {editStatus === 'loading' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                                <p className="text-gray-600 font-medium">กำลังบันทึก...</p>
                            </div>
                        )}

                        {editStatus === 'success' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <p className="text-xl text-gray-900">แก้ไขเสร็จสิ้น</p>
                            </div>
                        )}

                        {editStatus === 'error' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <p className="text-xl text-gray-900">เกิดข้อผิดพลาด</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
                    <DialogContent className="sm:max-w-[400px]">
                        {deleteStatus === 'idle' && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-red-600">ยืนยันการลบ</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <p className="text-gray-700">ต้องการลบงาน <span className="font-medium">"{title}"</span> ใช่หรือไม่?</p>
                                    <p className="text-sm text-gray-400 mt-1">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                                </div>
                                <DialogFooter className="gap-3 sm:gap-2 flex sm:justify-end">
                                    <Button
                                        type="button"
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1 sm:flex-none"
                                        onClick={handleConfirmDelete}
                                    >
                                        ใช่ ลบเลย
                                    </Button>
                                    <Button variant="ghost" className="text-gray-500 hover:text-gray-700 flex-1 sm:flex-none" onClick={() => handleDeleteOpenChange(false)}>
                                        ยกเลิก
                                    </Button>
                                </DialogFooter>
                            </>
                        )}

                        {deleteStatus === 'loading' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                                <p className="text-gray-600 font-medium">กำลังลบ...</p>
                            </div>
                        )}

                        {deleteStatus === 'success' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <p className="text-xl text-gray-900">ลบงานเสร็จสิ้น</p>
                            </div>
                        )}

                        {deleteStatus === 'error' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <p className="text-xl text-gray-900">เกิดข้อผิดพลาด</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
