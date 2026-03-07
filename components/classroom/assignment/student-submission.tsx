"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Paperclip, File as FileIcon, Loader2, AlertTriangle } from "lucide-react";
import { submitWork, unsubmitWork } from "@/app/actions/submission";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StudentSubmissionProps {
    classroomId: string;
    assignmentId: string;
    initialStatus: string | null;
    initialFiles: any[];
}

export default function StudentSubmission({ classroomId, assignmentId, initialStatus, initialFiles }: StudentSubmissionProps) {
    const submitFileInputRef = useRef<HTMLInputElement>(null);
    const [submittedFiles, setSubmittedFiles] = useState<any[]>(initialFiles);
    const [showUnsubmitWarning, setShowUnsubmitWarning] = useState(false);

    const isActuallySubmitted = ["assigned", "submitted", "late", "graded"].includes(initialStatus ?? "");
    const isGraded = initialStatus === "graded";
    const [isPending, startTransition] = useTransition();

    const handleSubmitSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((f) => ({
                name: f.name,
                size: f.size,
                type: f.name.split(".").pop()?.toUpperCase() || "FILE",
                fileRef: f
            }));
            setSubmittedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeSubmittedFile = (indexToRemove: number) => {
        setSubmittedFiles(submittedFiles.filter((_, index) => index !== indexToRemove));
    };

    const doUnsubmit = () => {
        startTransition(async () => {
            const res = await unsubmitWork(classroomId, assignmentId);
            if (res.error) alert(res.error);
        });
    };

    const doSubmit = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('classroomId', classroomId);
            formData.append('assignmentId', assignmentId);

            submittedFiles.forEach((fileObj) => {
                if (fileObj.fileRef) {
                    formData.append('files', fileObj.fileRef);
                }
            });

            const res = await submitWork(formData);
            if (res.error) alert(res.error);
        });
    };

    const handleToggleSubmit = () => {
        if (isActuallySubmitted) {
            if (isGraded) {
                // แสดง dialog เตือนก่อนยกเลิกเมื่อมีคะแนนแล้ว
                setShowUnsubmitWarning(true);
            } else {
                doUnsubmit();
            }
        } else {
            doSubmit();
        }
    };

    return (
        <>
            <div className="w-full md:w-[320px] shrink-0">
                <Card className="p-4 rounded-xl shadow-none border bg-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-blue-600">งานของคุณ</h2>
                        {isGraded && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                ตรวจแล้ว
                            </span>
                        )}
                    </div>

                    {submittedFiles.length > 0 && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {submittedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 border border-gray-100 p-2 rounded-md"
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <FileIcon className="h-4 w-4 text-gray-500 shrink-0" />
                                        <span className="text-sm truncate text-gray-700">{file.name}</span>
                                    </div>
                                    {!isActuallySubmitted && (
                                        <button
                                            onClick={() => removeSubmittedFile(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                                            disabled={isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {!isActuallySubmitted && (
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
                                    className="w-full text-blue-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white font-medium disabled:opacity-50"
                                    onClick={() => submitFileInputRef.current?.click()}
                                    disabled={isPending}
                                >
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    เพิ่มไฟล์
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={handleToggleSubmit}
                            disabled={isPending}
                            className={`w-full font-medium transition-colors ${isActuallySubmitted || submittedFiles.length > 0
                                ? isGraded
                                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {isActuallySubmitted
                                ? "ยกเลิกการส่ง"
                                : submittedFiles.length > 0
                                    ? "ส่งงานเลย"
                                    : "ทำเครื่องหมายว่าเสร็จสิ้น"}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Warning Dialog เมื่อยกเลิกงานที่ตรวจแล้ว */}
            <AlertDialog open={showUnsubmitWarning} onOpenChange={setShowUnsubmitWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-5 w-5" />
                            ยืนยันการยกเลิกการส่งงาน
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <span className="block">
                                งานชิ้นนี้ <strong>ได้รับการตรวจและให้คะแนนแล้ว</strong>
                            </span>
                            <span className="block text-red-600 font-medium">
                                หากยกเลิกการส่ง คะแนนที่ได้รับจะถูกลบออกทันที
                            </span>
                            <span className="block">
                                คุณต้องการดำเนินการต่อหรือไม่?
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                                setShowUnsubmitWarning(false);
                                doUnsubmit();
                            }}
                        >
                            ยืนยัน ยกเลิกการส่ง
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
