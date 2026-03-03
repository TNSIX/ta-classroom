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
import { useState } from 'react';
import { Loader2, CheckCircle, Clock } from 'lucide-react';

interface JoinClassDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function JoinClassDialog({ isOpen, onOpenChange }: JoinClassDialogProps) {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'waiting'>('idle');

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            // Reset form when dialog closes
            setTimeout(() => {
                setCode("");
                setStatus('idle');
            }, 300);
        }
    }

    const handleJoin = () => {
        if (code.length !== 8) return;

        setStatus('loading');

        setTimeout(() => {
            // จำลองการตรวจสอบความเป็นส่วนตัว
            // ถ้ารหัสมีตัว p หรือ P นำหน้า จะถือว่าเป็นห้องส่วนตัวที่ต้องรออนุมัติ
            if (code.trim().toLowerCase().startsWith('p')) {
                setStatus('waiting');
            } else {
                setStatus('success');
            }

            // ปิด popup อัตโนมัติหลังจากแสดงผลลัพธ์
            setTimeout(() => {
                handleOpenChange(false);
            }, 2000);
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                {status === 'idle' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-blue-600">เข้าร่วมชั้นเรียน</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="code" className="text-gray-700">
                                        รหัสชั้นเรียน
                                    </Label>
                                    <span className="text-xs text-muted-foreground">{code.length}/8</span>
                                </div>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="กรอกรหัสชั้นเรียน"
                                    maxLength={8}
                                    className="bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-blue-600 transition-colors"
                                />
                                <p className="text-xs text-muted-foreground mt-1 text-gray-500">
                                    สอบถามรหัสชั้นเรียนจากครูผู้สอนแล้วป้อนรหัสที่นี่
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" className="text-gray-500 hover:text-gray-700 mr-4" onClick={() => handleOpenChange(false)}>
                                ยกเลิก
                            </Button>
                            <Button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                disabled={code.length !== 8}
                                onClick={handleJoin}
                            >
                                เข้าร่วม
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {status === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        <p className="text-gray-600 font-medium">กำลังดำเนินการ...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <p className="text-xl text-gray-900">เข้าร่วมชั้นเรียนสำเร็จ</p>
                    </div>
                )}

                {status === 'waiting' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Clock className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-xl text-gray-900">รอการอนุมัติจากอาจารย์</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
