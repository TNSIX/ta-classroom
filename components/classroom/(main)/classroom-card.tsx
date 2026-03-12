'use client';

import { MoreVertical, User, ArrowRight, Pencil, Trash, Globe, Lock, Plus, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useActionState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { editClassroom, deleteClassroom } from '@/app/actions/classroom';

export type Role = "creator" | "manager" | "member" | "student";

interface ClassCardProps {
    id: string;
    name: string;
    description: string;
    isPrivate?: boolean;
    creatorName: string;
    creatorFirstName?: string;
    creatorAvatarUrl?: string | null;
    role?: Role;
}

export default function ClassCard({
    id,
    name: initialName,
    description: initialDescription,
    isPrivate: initialIsPrivate = false,
    creatorName,
    creatorFirstName = '',
    creatorAvatarUrl = null,
    role = "creator"
}: ClassCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription || "");
    const [privacy, setPrivacy] = useState(initialIsPrivate ? "private" : "public");

    // Temporary state for editing
    const [tempName, setTempName] = useState("");
    const [tempDescription, setTempDescription] = useState("");
    const [tempPrivacy, setTempPrivacy] = useState(initialIsPrivate ? "private" : "public");
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success'>('idle');

    const [editState, editAction, isEditPending] = useActionState(editClassroom, null);
    const [deleteState, deleteAction, isDeletePending] = useActionState(deleteClassroom, null);

    const handleEditClick = () => {
        setTempName(name);
        setTempDescription(description);
        setTempPrivacy(privacy);
        setStatus('idle');
        setIsEditOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) {
            setTimeout(() => setStatus('idle'), 300);
        }
    };

    const handleDeleteClick = () => {
        setDeleteStatus('idle');
        setIsDeleteOpen(true);
    };

    const handleDeleteOpenChange = (open: boolean) => {
        setIsDeleteOpen(open);
        if (!open) {
            setTimeout(() => setDeleteStatus('idle'), 300);
        }
    };

    // Effect for Edit
    useEffect(() => {
        if (editState?.success && !isEditPending && status !== 'success') {
            setStatus('success');
            setName(tempName);
            setDescription(tempDescription);
            setPrivacy(tempPrivacy);
            const timer = setTimeout(() => handleOpenChange(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [editState, isEditPending]);

    // Effect for Delete
    useEffect(() => {
        if (deleteState?.success && !isDeletePending && deleteStatus !== 'success') {
            setDeleteStatus('success');
            const timer = setTimeout(() => handleDeleteOpenChange(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [deleteState, isDeletePending]);

    return (
        <>
            <Link href={`/classroom/${id}/forum`} className="group w-[300px] h-[160px] bg-white rounded-2xl border border-gray-200 p-4 hover:bg-blue-50 hover:border-blue-200 transition-shadow cursor-pointer relative flex gap-4">
                {/* Context Menu - Absolute Top Right */}
                {role === "creator" && (
                    <div
                        className="absolute top-3 right-2 z-10"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition-colors focus:outline-none"
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className='p-2 space-y-1'>
                                <DropdownMenuItem onClick={handleEditClick} className='transition-colors ease-in-out p-2 text-gray-800 focus:text-blue-600 cursor-pointer border border-transparent focus:bg-blue-50 focus:border-blue-200'>
                                    <Pencil className=" h-4 w-4 focus:text-blue-600 transition-colors ease-in-out" />
                                    <span className="">แก้ไข</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDeleteClick} className='transition-colors ease-in-out p-2 text-gray-800 focus:text-red-600 cursor-pointer border border-transparent focus:bg-red-50 focus:border-red-200'>
                                    <Trash className=" h-4 w-4 focus:text-red-600 transition-colors ease-in-out" />
                                    <span className="">ลบ</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Left: Avatar */}
                <div className="flex-shrink-0 flex items-center">
                    <Avatar className="w-20 h-20">
                        <AvatarImage
                            src={creatorAvatarUrl || undefined}
                            alt={creatorName}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-semibold">
                            {creatorFirstName ? creatorFirstName.charAt(0).toUpperCase() : <User size={32} />}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Right: Content */}
                <div className="flex flex-col flex-1 min-w-0 py-1">
                    {/* Title */}
                    <h3 className="text-md text-gray-900 leading-tight truncate pr-6">
                        {name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-400 mt-1 mb-2 break-words whitespace-pre-wrap line-clamp-4">
                        {description}
                    </p>

                    {/* Footer: User / Teacher */}
                    <div className="mt-auto flex items-center gap-2">
                        <User size={14} className="text-gray-900" />
                        <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                            {creatorName}
                        </span>
                    </div>

                    {/* Action Arrow - Absolute Bottom Right */}
                    <div className="absolute bottom-4 right-4 text-gray-900 group-hover:translate-x-1 transition-transform group-hover:text-blue-600">
                        <ArrowRight size={20} />
                    </div>
                </div>
            </Link>


            <Dialog open={isEditOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
                    {status === 'idle' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-blue-600">แก้ไขชั้นเรียน</DialogTitle>
                            </DialogHeader>
                            <form action={editAction}>
                                <input type="hidden" name="id" value={id} />
                                <div className="grid gap-6 overflow-y-auto pr-2 py-4">
                                    {editState?.error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                                            {editState.error}
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="edit-name" className="text-gray-700">
                                                ชื่อชั้นเรียน <span className="text-red-500">*</span>
                                            </Label>
                                            <span className="text-xs text-muted-foreground">{tempName.length}/100</span>
                                        </div>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            placeholder="ระบุชื่อชั้นเรียน..."
                                            maxLength={100}
                                            className="bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-blue-600 transition-colors"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="edit-description" className="text-gray-700">
                                                คำอธิบายชั้นเรียน
                                            </Label>
                                            <span className="text-xs text-muted-foreground">{tempDescription.length}/200</span>
                                        </div>
                                        <Textarea
                                            id="edit-description"
                                            name="description"
                                            value={tempDescription}
                                            onChange={(e) => setTempDescription(e.target.value)}
                                            placeholder="พิมพ์คำอธิบายชั้นเรียนที่นี่..."
                                            maxLength={200}
                                            className="min-h-[100px] resize-none bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-blue-600 transition-colors"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-gray-700">ความเป็นส่วนตัว</Label>
                                        <div className="flex gap-3 pt-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 justify-center h-auto py-3 border transition-all hover:bg-blue-50 hover:text-blue-700",
                                                    tempPrivacy === "public"
                                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                                        : "border-gray-200 text-gray-600 bg-transparent"
                                                )}
                                                onClick={() => setTempPrivacy("public")}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <Globe className="h-5 w-5" />
                                                    <span>สาธารณะ</span>
                                                </div>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 justify-center h-auto py-3 border transition-all hover:bg-blue-50 hover:text-blue-700",
                                                    tempPrivacy === "private"
                                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                                        : "border-gray-200 text-gray-600 bg-transparent"
                                                )}
                                                onClick={() => setTempPrivacy("private")}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <Lock className="h-5 w-5" />
                                                    <span>ส่วนตัว</span>
                                                </div>
                                            </Button>
                                            <input type="hidden" name="privacy" value={tempPrivacy} />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                    <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => handleOpenChange(false)}>
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        disabled={!tempName.trim() || isEditPending}
                                    >
                                        {isEditPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isEditPending ? "กำลังบันทึก..." : "บันทึก"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </>
                    )}

                    {status === 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <p className="text-xl text-gray-900">แก้ไขเสร็จสิ้น</p>
                        </div>
                    )}

                    {editState?.error && !isEditPending && status !== 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <p className="text-xl text-gray-900">เกิดข้อผิดพลาด: {editState.error}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
                <DialogContent className="sm:max-w-[400px]">
                    {deleteStatus === 'idle' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-red-600">ยืนยันการลบ</DialogTitle>
                            </DialogHeader>
                            <form action={deleteAction}>
                                <input type="hidden" name="id" value={id} />
                                <div className="py-2">
                                    {deleteState?.error && (
                                        <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                                            {deleteState.error}
                                        </div>
                                    )}
                                    <p className="text-gray-700 text-start">
                                        ต้องการลบชั้นเรียน <span className="font-semibold text-gray-900">{name}</span> ใช่หรือไม่?
                                    </p>
                                </div>
                                <DialogFooter className="gap-3 sm:gap-2 flex sm:justify-end mt-4">
                                    <Button
                                        type="submit"
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1 sm:flex-none w-full sm:w-auto"
                                        disabled={isDeletePending}
                                    >
                                        {isDeletePending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {isDeletePending ? "กำลังลบ..." : "ใช่"}
                                    </Button>
                                    <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700 flex-1 sm:flex-none w-full sm:w-auto" onClick={() => handleDeleteOpenChange(false)}>
                                        ไม่ใช่
                                    </Button>
                                </DialogFooter>
                            </form>
                        </>
                    )}

                    {deleteStatus === 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <p className="text-xl text-gray-900">ลบชั้นเรียนเสร็จสิ้น</p>
                        </div>
                    )}

                    {deleteState?.error && !isDeletePending && deleteStatus !== 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <p className="text-xl text-gray-900">เกิดข้อผิดพลาด: {deleteState.error}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </>
    );
}