'use client';

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ClassroomID() {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText('ABCD1234');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 pl-6 p-4 w-64">
            {/* Header */}
            <div className="mb-2">
                <h2 className="text-base font-medium text-gray-800">รหัสชั้นเรียน</h2>
            </div>

            {/* Code Display */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-lg text-blue-600">ABCD1234</h1>
                </div>
                <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleCopy}
                    title={copied ? "คัดลอกแล้ว" : "คัดลอกรหัส"}
                >
                    {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                    ) : (
                        <Copy className="w-5 h-5 text-gray-800" />
                    )}
                </button>
            </div>
        </div>
    );
}