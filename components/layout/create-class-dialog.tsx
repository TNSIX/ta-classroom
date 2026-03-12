"use client"

import { Globe, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { useState, useActionState, useEffect } from 'react'
import { createClassroom } from '@/app/actions/classroom'

interface CreateClassDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateClassDialog({ isOpen, onOpenChange }: CreateClassDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState("public");
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [state, formAction, isPending] = useActionState(createClassroom, null);

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            // Reset form when dialog closes
            setTimeout(() => {
                setName("");
                setDescription("");
                setPrivacy("public");
                setStatus('idle');
            }, 300);
        }
    }

    // Effect for handling state success
    useEffect(() => {
        if (state?.success && !isPending) {
            setStatus('success');
            // ปิด popup อัตโนมัติหลังจากแสดงผลลัพธ์
            const timer = setTimeout(() => {
                handleOpenChange(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [state, isPending]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
                {status === 'idle' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-blue-600">สร้างชั้นเรียนใหม่</DialogTitle>
                        </DialogHeader>
                        <form action={formAction} className="flex flex-col flex-1 overflow-hidden">
                            <div className="grid gap-6 overflow-y-auto pr-2 py-4">
                                {state?.error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                                        {state.error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="name" className="text-gray-700">
                                            ชื่อชั้นเรียน <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{name.length}/100</span>
                                    </div>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ระบุชื่อชั้นเรียน..."
                                        maxLength={100}
                                        className="bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-blue-600 transition-colors"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="description" className="text-gray-700">
                                            คำอธิบายชั้นเรียน
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{description.length}/200</span>
                                    </div>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
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
                                                "flex-1 justify-center h-auto py-3 border transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
                                                privacy === "public"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 text-gray-600 bg-transparent"
                                            )}
                                            onClick={() => setPrivacy("public")}
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
                                                "flex-1 justify-center h-auto py-3 border transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
                                                privacy === "private"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 text-gray-600 bg-transparent"
                                            )}
                                            onClick={() => setPrivacy("private")}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <Lock className="h-5 w-5" />
                                                <span>ส่วนตัว</span>
                                            </div>
                                        </Button>
                                        <input type="hidden" name="privacy" value={privacy} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700 mr-4" onClick={() => handleOpenChange(false)}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={!name.trim() || isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isPending ? "กำลังสร้าง..." : "สร้างชั้นเรียน"}
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
                        <p className="text-xl text-gray-900">สร้างชั้นเรียนสำเร็จ</p>
                    </div>
                )}
                {state?.error && !isPending && status !== 'success' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <p className="text-xl text-gray-900">เกิดข้อผิดพลาด: {state.error}</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
