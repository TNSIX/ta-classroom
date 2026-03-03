import { FileText } from "lucide-react";

interface FileAttachmentProps {
    fileName: string;
    fileSize: string;
    fileType?: string;
}

export default function FileAttachment({ fileName, fileSize, fileType = "PDF" }: FileAttachmentProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg w-full max-w-md cursor-pointer hover:bg-gray-50 transition-colors group">
            <div className="text-blue-600 flex-shrink-0">
                <FileText className="h-full w-full" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
                <span className="text-xs text-gray-500">{fileType} • {fileSize}</span>
            </div>
        </div>
    );
}
