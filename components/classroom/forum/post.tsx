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
import { useState, useRef } from "react";
import FileAttachment from "@/components/classroom/forum/file-attachment";
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

interface ForumPostProps {
    id?: number | string;
    onDelete?: (id: number | string) => void;
    role?: "member" | "manager" | "creator"; // เพิ่ม role เพื่อใช้เช็คสิทธิ์
}

export function ForumPost({ id, onDelete, role }: ForumPostProps) {
    const initialFiles = [
        { name: "เอกสารประกอบการสอน_บทที่_1.pdf", size: 2.4 * 1024 * 1024, type: "PDF" },
        { name: "แบบฝึกหัดเสริม.docx", size: 1.2 * 1024 * 1024, type: "DOCX" },
        { name: "รูปภาพประกอบ.png", size: 500 * 1024, type: "PNG" },
        { name: "แบบฝึกหัดเสริม.docx", size: 1.2 * 1024 * 1024, type: "DOCX" },
        { name: "รูปภาพประกอบ.png", size: 500 * 1024, type: "PNG" }
    ];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [title, setTitle] = useState("หัวข้อประกาศ");
    const [content, setContent] = useState("เนื้อหาประกาศ");
    const [editTitle, setEditTitle] = useState(title);
    const [editContent, setEditContent] = useState(content);

    // File states
    const [files, setFiles] = useState<any[]>(initialFiles);
    const [editFiles, setEditFiles] = useState<any[]>(initialFiles);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        return (bytes / 1024).toFixed(0) + " KB";
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

    const handleEditClick = () => {
        setEditTitle(title);
        setEditContent(content);
        setEditFiles(files);
        setIsEditOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            setTimeout(() => setStatus('idle'), 300);
        }
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;

        setStatus('loading');

        setTimeout(() => {
            if (editTitle.toLowerCase().includes('error')) {
                setStatus('error');
            } else {
                setTitle(editTitle);
                setContent(editContent);
                setFiles(editFiles);
                setStatus('success');
            }

            setTimeout(() => {
                handleOpenChange(false);
            }, 2000);
        }, 1500);
    };

    const handleCancel = () => {
        handleOpenChange(false);
    };

    const handleDeleteClick = (e: Event) => {
        e.preventDefault();
        setDeleteStatus('idle');
        setIsDeleteOpen(true);
    };

    const handleDeleteOpenChange = (open: boolean) => {
        setIsDeleteOpen(open);
        if (!open) {
            setTimeout(() => setDeleteStatus('idle'), 300);
        }
    };

    const handleConfirmDelete = () => {
        setDeleteStatus('loading');

        setTimeout(() => {
            if (title.toLowerCase().includes('error')) {
                setDeleteStatus('error');
            } else {
                setDeleteStatus('success');
            }

            setTimeout(() => {
                handleDeleteOpenChange(false);
                setIsDeleted(true);
                if (onDelete && id !== undefined) {
                    onDelete(id);
                }
            }, 2000);
        }, 1500);
    };

    if (isDeleted) return null;

    return (
        <Card className="w-full border-gray-200 shadow-none rounded-xl overflow-hidden bg-gray-50 transition-colors py-0">
            <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10 bg-gray-300">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gray-300 text-gray-600">
                                <ImageIcon className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-gray-900">
                                ชื่อ นามสกุล
                            </span>
                            <span className="text-sm text-gray-500">
                                ประกาศวันที่ 11 ส.ค. 2568 9:23 น.
                            </span>
                        </div>
                    </div>
                    {role !== "member" && (
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
                                    <Pencil className="h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                    <span>แก้ไข</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDeleteClick} className='transition-colors ease-in-out p-2 text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200'>
                                    <Trash className="h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                    <span>ลบ</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Content */}
                <div className="w-full">
                    <h3 className="text-blue-600 font-medium break-words">
                        {title}
                    </h3>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap break-words">
                        {content}
                    </p>

                    {/* ตัวอย่างการแสดงไฟล์แนบ */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file, idx) => (
                            <FileAttachment key={idx} fileName={file.name} fileSize={formatSize(file.size)} fileType={file.type} />
                        ))}
                    </div>
                </div>

            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                    {status === 'idle' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-blue-600">แก้ไขประกาศ</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-6 overflow-y-auto pr-2 py-4">
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="title" className="text-gray-700">
                                            หัวข้อประกาศ <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{editTitle.length}/100</span>
                                    </div>
                                    <Input
                                        id="title"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="ระบุหัวข้อประกาศ..."
                                        maxLength={100}
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-gray-700">
                                        รายละเอียด
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="พิมพ์รายละเอียดประกาศที่นี่..."
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
                                        onClick={() => fileInputRef.current?.click()}
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
                                                        onClick={() => removeFile(index)}
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
                <DialogContent className="sm:max-w-[400px]">
                    {deleteStatus === 'idle' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-red-600">ยืนยันการลบ</DialogTitle>
                            </DialogHeader>
                            <div>
                                <p className="text-gray-700 text-start break-words">
                                    ต้องการลบประกาศใช่หรือไม่?
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
                                <Button variant="ghost" className="text-gray-500 hover:text-gray-700 flex-1 sm:flex-none w-full sm:w-auto" onClick={() => handleDeleteOpenChange(false)}>
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
                            <p className="text-xl text-gray-900">ลบประกาศเสร็จสิ้น</p>
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
