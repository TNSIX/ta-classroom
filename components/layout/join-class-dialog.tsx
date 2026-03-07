"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useActionState, useEffect } from 'react';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { joinClassroom } from '@/app/actions/classroom';

interface JoinClassDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function JoinClassDialog({ isOpen, onOpenChange }: JoinClassDialogProps) {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<'idle' | 'success' | 'pending'>('idle');
    const [pendingClassName, setPendingClassName] = useState('');
    const [showError, setShowError] = useState(false);
    const [state, formAction, isPending] = useActionState(joinClassroom, null);

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            // Reset form when dialog closes
            setTimeout(() => {
                setCode("");
                setStatus('idle');
                setShowError(false); // ล้าง error เมื่อปิด dialog
            }, 300);
        } else {
            // ล้าง error ทุกครั้งที่ dialog เปิดใหม่
            setShowError(false);
        }
    }

    // Effect for handling state success / error / pending
    useEffect(() => {
        if (state?.success && !isPending) {
            if ((state as any).pending) {
                // ชั้นเรียนเป็นส่วนตัว → รออนุมัติ
                setPendingClassName((state as any).classroomName || '');
                setStatus('pending');
            } else {
                // ชั้นเรียนสาธารณะ → เข้าร่วมสำเร็จ
                setStatus('success');
                const timer = setTimeout(() => {
                    handleOpenChange(false);
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
        if (state?.error && !isPending) {
            setShowError(true);
        }
    }, [state, isPending]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                {status === 'idle' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-blue-600">เข้าร่วมชั้นเรียน</DialogTitle>
                        </DialogHeader>
                        <form action={formAction}>
                            <div className="grid gap-6 py-4">
                                {showError && state?.error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                                        {state.error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="code" className="text-gray-700">
                                            รหัสชั้นเรียน
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{code.length}/8</span>
                                    </div>
                                    <Input
                                        id="code"
                                        name="code"
                                        value={code}
                                        onChange={(e) => {
                                            setCode(e.target.value);
                                            if (showError) setShowError(false); // ล้าง error เมื่อพิมพ์รหัสใหม่
                                        }}
                                        placeholder="กรอกรหัสชั้นเรียน"
                                        maxLength={8}
                                        className="bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-blue-600 transition-colors"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 text-gray-500">
                                        สอบถามรหัสชั้นเรียนจากครูผู้สอนแล้วป้อนรหัสที่นี่
                                    </p>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700 mr-4" onClick={() => handleOpenChange(false)}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={code.length !== 8 || isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isPending ? "กำลังเข้าร่วม..." : "เข้าร่วม"}
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
                        <p className="text-xl text-gray-900">เข้าร่วมชั้นเรียนสำเร็จ</p>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-9 w-9 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">รอการอนุมัติ</p>
                            <p className="text-sm text-gray-500 mt-1">คำขอเข้าร่วมชั้นเรียน <span className="font-medium text-gray-800">{pendingClassName}</span> ถูกส่งเรียบร้อยแล้ว</p>
                            <p className="text-sm text-gray-400 mt-1">กรุณารอครูอนุมัติคำขอของคุณ</p>
                        </div>
                        <button
                            onClick={() => handleOpenChange(false)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ปิดหน้าต่างนี้
                        </button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
