"use client"

import { Megaphone, Paperclip, X, File as FileIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "radix-ui"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useRef, useActionState, useEffect } from 'react';
import { createForumPost } from '@/app/actions/forum';

interface CreateForumButtonProps {
    classroomId: string; // รับ ID ของห้องบรรยายเข้ามา
    onCreatePost?: (post: any) => void;
}

export default function CreateForumButton({ classroomId, onCreatePost }: CreateForumButtonProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [state, formAction, isPending] = useActionState(createForumPost, null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // ติดตามว่า user ได้กด submit จริงในรอบนี้หรือยัง
    // ป้องกัน state ค้างจาก useActionState ทำให้ success screen โชว์ทันทีตอนเปิด dialog ใหม่
    const hasSubmitted = useRef(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset hasSubmitted ทุกครั้งที่เปิด dialog ใหม่
            hasSubmitted.current = false;
        }
        if (!open) {
            // Reset form when dialog closes
            setTimeout(() => {
                setTitle("");
                setDescription("");
                setFiles([]);
                setStatus('idle');
            }, 300); // Small delay to avoid flickering while closing
        }
    }

    // Effect for handling state success
    // ตรวจสอบ hasSubmitted.current ก่อน เพื่อป้องกัน state ค้างจากครั้งก่อน
    useEffect(() => {
        if (state?.success && !isPending && hasSubmitted.current) {
            setStatus('success');
            if (onCreatePost) {
                onCreatePost({ id: Date.now(), title, description, files });
            }
            // ปิด dialog อัตโนมัติหลัง 1.5 วินาที
            const timer = setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => {
                    setTitle("");
                    setDescription("");
                    setFiles([]);
                    setStatus('idle');
                    hasSubmitted.current = false;
                }, 300);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [state?.success ?? false, isPending]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg w-64 justify-center shadow-sm transition-colors">
                    <Megaphone size={18} />
                    <span className="font-medium">สร้างประกาศ</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                {/* DialogTitle ต้องมีอยู่เสมอเพื่อ accessibility */}
                {status === 'idle' ? (
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-blue-600">สร้างประกาศใหม่</DialogTitle>
                    </DialogHeader>
                ) : (
                    <VisuallyHidden.Root>
                        <DialogTitle>สร้างประกาศใหม่</DialogTitle>
                    </VisuallyHidden.Root>
                )}
                {status === 'idle' && (
                    <>
                        <form action={(formData) => {
                            hasSubmitted.current = true; // บันทึกว่า user กด submit แล้ว
                            files.forEach(file => {
                                formData.append("files", file);
                            });
                            formAction(formData);
                        }}>
                            <input type="hidden" name="classroomId" value={classroomId} />
                            <div className="flex flex-col gap-4 overflow-y-auto mt-4">
                                {state?.error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                                        {state.error}
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="title" className="text-gray-700">
                                            หัวข้อประกาศ <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{title.length}/100</span>
                                    </div>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ระบุหัวข้อประกาศ..."
                                        maxLength={100}
                                        className="bg-gray-50 border-gray-200 focus-visible:ring-blue-600 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="description" className="text-gray-700">
                                        รายละเอียด
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="พิมพ์รายละเอียดประกาศที่นี่..."
                                        className="min-h-[150px] resize-none bg-gray-50 border-gray-200 focus-visible:ring-blue-600 transition-colors"
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
                                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-dashed border-gray-300 hover:border-blue-200"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        แนบไฟล์ประกอบ
                                    </Button>

                                    {/* Selected Files List */}
                                    {files.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                                    <div className="flex items-center text-gray-700 truncate">
                                                        <FileIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                                                        <span className="truncate max-w-[400px]">{file.name}</span>
                                                        <span className="ml-2 text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0 mt-6">
                                <DialogTrigger asChild className='mr-4'>
                                    <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700">
                                        ยกเลิก
                                    </Button>
                                </DialogTrigger>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={!title.trim() || isPending}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isPending ? "กำลังสร้าง..." : "สร้างประกาศ"}
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
                        <p className="text-xl text-gray-900">สร้างประกาศสำเร็จ</p>
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