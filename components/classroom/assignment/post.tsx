"use client";

import { MoreVertical, Image as ImageIcon, Pencil, Trash, Paperclip, X, File as FileIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { editAssignment, deleteAssignment } from "@/app/actions/assignment";
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

interface AssignmentPostProps {
    classroomId: string;
    assignmentId: string;
    initialTitle?: string;
    initialDescription?: string;
    dueDate?: string | null;
    points?: number;
    createdAt?: string;
    role?: "member" | "manager" | "creator" | "student";
    initialFiles?: any[];
}

export default function AssignmentPost({ classroomId, assignmentId, initialTitle, initialDescription, dueDate: initialDueDate, points, createdAt, role, initialFiles: passedFiles }: AssignmentPostProps) {
    const router = useRouter();

    const initialFiles: any[] = passedFiles || [];

    // Helper function สำหรับแยกวันที่และเวลาออกจาก ISO date
    const getInitialDateInfo = () => {
        if (!initialDueDate) return { date: "", time: "" };
        const d = new Date(initialDueDate);
        if (isNaN(d.getTime())) return { date: "", time: "" };

        // รูปแบบ YYYY-MM-DD
        const dateStr = d.toISOString().split('T')[0];
        // รูปแบบ HH:MM
        const timeStr = d.toTimeString().substring(0, 5);
        return { date: dateStr, time: timeStr };
    };

    const initDateInfo = getInitialDateInfo();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [title, setTitle] = useState(initialTitle || "ชื่องาน");
    const [dueDate, setDueDate] = useState(initDateInfo.date || "");
    const [dueTime, setDueTime] = useState(initDateInfo.time || "");
    const [score, setScore] = useState(points !== undefined && points !== null && points !== 0 ? points.toString() : "");
    const [description, setDescription] = useState(initialDescription || "");
    const [files, setFiles] = useState<any[]>(initialFiles);

    // Edit states
    const [editTitle, setEditTitle] = useState(title);
    const [editDueDate, setEditDueDate] = useState(initDateInfo.date || "");
    const [editDueTime, setEditDueTime] = useState(initDateInfo.time || "");
    const [editScore, setEditScore] = useState(score);
    const [editDescription, setEditDescription] = useState(description);
    // แยกไฟล์ออกเป็น 2 ประเภท
    const [editExistingFiles, setEditExistingFiles] = useState<any[]>(initialFiles); // ไฟล์เดิมจาก DB (มี id)
    const [editNewFiles, setEditNewFiles] = useState<File[]>([]);                   // ไฟล์ใหม่ที่อยู่ใน memory
    const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);             // IDs ที่ถูกลบ

    const fileInputRef = useRef<HTMLInputElement>(null);
    // ป้องกัน click-through เมื่อปิด dialog แล้ว click ตกมาที่ Card
    const justClosedRef = useRef(false);

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 KB";
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        return (bytes / 1024).toFixed(0) + " KB";
    };

    const formatDate = (dateString: string, timeString: string) => {
        if (!dateString || dateString === "ไม่มีกำหนด") return "ไม่มีกำหนดส่ง";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return `กำหนดส่งวันที่ ${dateString} ${timeString} น.`;
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        return `กำหนดส่งวันที่ ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543} ${timeString} น.`;
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

    const handleEditClick = (e: Event) => {
        e.stopPropagation();
        // ใช้ state ล่าสุด
        setEditTitle(title);
        setEditDueDate(dueDate);
        setEditDueTime(dueTime);
        setEditScore(score);
        setEditDescription(description);
        setEditExistingFiles(files); // reset เป็นไฟล์ปัจจุบัน
        setEditNewFiles([]);
        setDeletedFileIds([]);
        setStatus('idle');
        setIsEditOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            justClosedRef.current = true;
            setTimeout(() => {
                justClosedRef.current = false;
                setStatus('idle');
            }, 300);
        }
    };

    const handleDeleteClick = (e: Event) => {
        e.preventDefault();
        setDeleteStatus('idle');
        setIsDeleteOpen(true);
    };

    const handleDeleteOpenChange = (open: boolean) => {
        setIsDeleteOpen(open);
        if (!open) {
            justClosedRef.current = true;
            setTimeout(() => {
                justClosedRef.current = false;
                setDeleteStatus('idle');
            }, 300);
        }
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteStatus('loading');

        const result = await deleteAssignment(assignmentId, classroomId);

        if (result?.error) {
            console.error(result.error);
            setDeleteStatus('error');
            setTimeout(() => setDeleteStatus('idle'), 2000);
            return;
        }

        setDeleteStatus('success');

        setTimeout(() => {
            handleDeleteOpenChange(false);
            setIsDeleted(true);
        }, 2000);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;

        setStatus('loading');

        const result = await editAssignment(
            assignmentId,
            classroomId,
            editTitle,
            editDescription,
            editDueDate,
            editDueTime,
            editScore,
            deletedFileIds,
            editNewFiles
        );

        if (result?.error) {
            console.error(result.error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
            return;
        }

        setTitle(editTitle);
        setDueDate(editDueDate);
        setDueTime(editDueTime);
        setScore(editScore);
        setDescription(editDescription);
        // update files state: เอาไฟล์ที่เหลือ + ไฟล์ใหม่เป็น placeholder
        const newFilePlaceholders = editNewFiles.map(f => ({ name: f.name, size: f.size, type: f.type || 'FILE' }));
        setFiles([...editExistingFiles, ...newFilePlaceholders]);
        setStatus('success');

        setTimeout(() => {
            handleOpenChange(false);
        }, 1500);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenChange(false);
    };

    const handleClick = () => {
        if (justClosedRef.current || isEditOpen || isDeleteOpen) return;
        router.push(`/classroom/${classroomId}/assignment/${assignmentId}/assignment_details`);
    };

    if (isDeleted) return null;

    return (
        <Card
            className="w-full border-gray-200 shadow-none rounded-xl overflow-hidden bg-gray-50 py-0 cursor-pointer"
            onClick={handleClick}
        >
            <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10 bg-gray-300">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gray-300 text-gray-600">
                                <ImageIcon className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-blue-600 break-words">
                                {title}
                            </span>
                            <span className="text-sm text-gray-500 break-words">
                                {formatDate(dueDate, dueTime)}
                            </span>
                        </div>
                    </div>
                    {role !== "student" && role !== "member" && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-blue-600 rounded-full"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className='p-2 space-y-1'>
                                    <DropdownMenuItem onSelect={handleEditClick} className='transition-colors ease-in-out p-2 text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent     focus:bg-blue-50 focus:border-blue-200'>
                                        <Pencil className=" h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                        <span className="">แก้ไข</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleDeleteClick} className='transition-colors ease-in-out p-2 text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200'>
                                        <Trash className=" h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                        <span className="">ลบ</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {status === 'idle' && (
                        <>
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

                                    {/* ไฟล์เดิมจาก DB */}
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
                        </>
                    )}

                    {status === 'loading' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                            <p className="text-gray-600 font-medium">กำลังบันทึก...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <p className="text-xl text-gray-900">แก้ไขเสร็จสิ้น</p>
                        </div>
                    )}

                    {status === 'error' && (
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
                <DialogContent className="sm:max-w-[400px]" onClick={(e) => e.stopPropagation()}>
                    {deleteStatus === 'idle' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-red-600">ยืนยันการลบ</DialogTitle>
                            </DialogHeader>
                            <div>
                                <p className="text-gray-700 text-start break-words">
                                    ต้องการลบงานใช่หรือไม่?
                                </p>
                            </div>
                            <DialogFooter className="gap-3 sm:gap-2 flex sm:justify-end">
                                <Button
                                    type="button"
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1 sm:flex-none w-full sm:w-auto"
                                    onClick={handleConfirmDelete}
                                >
                                    ใช่
                                </Button>
                                <Button variant="ghost" className="text-gray-500 hover:text-gray-700 flex-1 sm:flex-none w-full sm:w-auto" onClick={(e) => { e.stopPropagation(); handleDeleteOpenChange(false); }}>
                                    ไม่ใช่
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
        </Card>
    );
}