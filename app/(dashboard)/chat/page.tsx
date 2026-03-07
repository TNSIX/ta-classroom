'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, ThumbsUp, ThumbsDown, Copy, Square, Check, Cpu, Paperclip, X, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendChatMessage } from "@/app/actions/chat";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from "@/utils/supabase/client";


interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    isTyping?: boolean;
    feedback?: 'like' | 'dislike' | null;
    attachment?: { name: string; content: string };
}

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [isChatMode, setIsChatMode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [userName, setUserName] = useState("...");
    const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
    const [attachment, setAttachment] = useState<{ name: string, content: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setAttachment({ name: file.name, content });
        };
        reader.readAsText(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const stopTyping = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setIsTyping(false);
        setMessages(prev => prev.map(msg =>
            msg.isTyping ? { ...msg, isTyping: false } : msg
        ));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatMode]);

    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name')
                    .eq('id', user.id)
                    .single();

                const name = profile?.first_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "ผู้ใช้งาน";
                setUserName(name);
            } else {
                setUserName("ผู้ใช้งาน");
            }
        };
        fetchUser();
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        // หยุดแชทก่อนหน้าถ้ากำลัง generate อยู่ แล้วเริ่มแชทใหม่
        if (isTyping) {
            stopTyping();
        }

        if (!message.trim() && !attachment) return;

        setIsChatMode(true);
        // Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: message,
            attachment: attachment ? { ...attachment } : undefined
        };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        setMessage("");
        setAttachment(null);

        // Show typing indicator
        setIsTyping(true);
        const botMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: "กำลังคิด...", isTyping: true }]);

        try {
            // เรียกใช้งาน Groq AI
            const apiMessages = updatedMessages.map(m => {
                let contentText = m.text;
                if (m.attachment) {
                    contentText += `\n\n[ข้อมูลที่แนบมา: ${m.attachment.name}]\n\`\`\`\n${m.attachment.content}\n\`\`\``;
                }
                return { role: m.role, content: contentText };
            }) as { role: 'user' | 'bot' | 'system' | 'assistant', content: string }[];

            const response = await sendChatMessage(apiMessages, selectedModel);

            if (response.error) {
                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId ? { ...msg, text: response.error as string, isTyping: false } : msg
                ));
                setIsTyping(false);
                return;
            }

            const fullText = response.content || "";

            // Reset text and start typewriter
            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, text: "" } : msg
            ));

            let currentIndex = 0;
            typingIntervalRef.current = setInterval(() => {
                setMessages(prev => {
                    const newMessages = prev.map(msg => {
                        if (msg.id === botMsgId) {
                            if (currentIndex >= fullText.length) {
                                return { ...msg, text: fullText, isTyping: false };
                            }
                            return { ...msg, text: fullText.substring(0, currentIndex + 1) };
                        }
                        return msg;
                    });
                    return newMessages;
                });

                if (currentIndex >= fullText.length) {
                    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                    setIsTyping(false);
                } else {
                    // ให้พิมพ์เร็วขึ้นเพื่อ UI ที่ลื่นไหลเวลาตอบยาวๆ
                    currentIndex += 3;
                }
            }, 10);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId ? { ...msg, text: "เกิดข้อผิดพลาดในการเชื่อมต่อ", isTyping: false } : msg
            ));
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        if (isTyping) stopTyping();
        setMessages([]);
        setIsChatMode(false);
        setMessage("");
    };

    const handleFeedback = (id: string, type: 'like' | 'dislike') => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, feedback: msg.feedback === type ? null : type } : msg
        ));
    };

    return (
        <div className="flex flex-col items-center w-full h-[calc(100vh-65px)] px-4">
            <div className={`w-full max-w-[1200px] h-full flex flex-col relative transition-all duration-700 ease-in-out`}>

                {/* ส่วนแสดงข้อความ (Header / Chat List) */}
                <div className={`flex flex-col w-full transition-all duration-700 ease-in-out ${isChatMode ? 'flex-1 justify-end overflow-hidden pb-4' : 'flex-1 justify-end pb-8'}`}>

                    {/* Greeting Header - Fades out */}
                    <div className={`transition-all duration-700 ease-in-out flex flex-col items-start justify-start gap-2 ${isChatMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                        <div className="flex gap-2">
                            <h1 className="text-2xl font-black select-none text-gray-700">สวัสดี คุณ</h1>
                            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 select-none uppercase">{userName}</h2>
                        </div>
                        <h3 className="text-4xl font-black select-none text-gray-700">มีอะไรให้ช่วยไหม ?</h3>
                    </div>

                    {/* Chat Messages */}
                    {isChatMode && (
                        <div className="w-full flex-1 overflow-y-auto space-y-4 p-4 animate-in fade-in duration-500">
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`break-words ${msg.role === 'user'
                                        ? 'p-4 rounded-2xl max-w-[80%] shadow-sm bg-blue-600 text-white rounded-tr-sm'
                                        : 'w-full text-gray-800 py-2'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <div className="flex flex-col gap-1">
                                                {msg.attachment && (
                                                    <div className="flex items-center gap-2 bg-blue-700/50 p-2 rounded-lg text-sm max-w-full overflow-hidden mb-1">
                                                        <FileText size={16} className="shrink-0" />
                                                        <span className="truncate">{msg.attachment.name}</span>
                                                    </div>
                                                )}
                                                <span>{msg.text}</span>
                                            </div>
                                        ) : (
                                            <div className="leading-relaxed overflow-x-auto w-full">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-2 mb-1" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="border-collapse border border-gray-200 w-full text-sm" {...props} /></div>,
                                                        th: ({ node, ...props }) => <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900" {...props} />,
                                                        td: ({ node, ...props }) => <td className="border border-gray-200 px-3 py-2" {...props} />,
                                                        code: ({ node, inline, ...props }: any) =>
                                                            inline
                                                                ? <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                                                                : <code className="block bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto my-2" {...props} />
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback Buttons for Bot */}
                                    {msg.role === 'bot' && !msg.isTyping && (
                                        <div className="flex items-center gap-2 px-2 animate-in fade-in duration-300">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 rounded-full hover:bg-gray-100 ${msg.feedback === 'like' ? 'text-green-600 bg-green-50' : 'text-gray-400'}`}
                                                onClick={() => handleFeedback(msg.id, 'like')}
                                            >
                                                <ThumbsUp size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 rounded-full hover:bg-gray-100 ${msg.feedback === 'dislike' ? 'text-red-600 bg-red-50' : 'text-gray-400'}`}
                                                onClick={() => handleFeedback(msg.id, 'dislike')}
                                            >
                                                <ThumbsDown size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full text-gray-400 hover:bg-gray-100"
                                                onClick={() => handleCopy(msg.text, msg.id)}
                                            >
                                                {copiedId === msg.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes rainbow-shadow {
                        0% { box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4); }
                        17% { box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4); }
                        33% { box-shadow: 0 8px 30px rgba(234, 179, 8, 0.4); }
                        50% { box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4); }
                        67% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4); }
                        83% { box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4); }
                        100% { box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4); }
                    }
                    .animate-rainbow-shadow {
                        animation: rainbow-shadow 3s linear infinite;
                    }
                `}</style>

                {/* ส่วน Input + ปุ่มส่ง */}
                <div className={`w-full transition-all duration-700 ease-in-out ${isChatMode ? 'pb-12' : 'pb-[calc(50vh-40px)]'}`}>
                    <form onSubmit={handleSendMessage} className={`flex flex-col w-full bg-white rounded-[28px] p-2 transition-shadow duration-300 ${isTyping ? 'animate-rainbow-shadow' : 'shadow-[0_8px_30px_rgba(0,0,0,0.15)]'}`}>

                        {/* Input Area (Top) */}
                        <div className="w-full relative px-2 pt-2 pb-6">
                            {attachment && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2 mx-2 w-max max-w-[90%] group relative border border-gray-200 dark:border-gray-700">
                                    <FileText size={18} className="text-blue-600 shrink-0" />
                                    <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">{attachment.name}</span>
                                    <button type="button" onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-0.5 shadow-sm text-gray-500 hover:text-red-500 transition-colors z-10 w-6 h-6 flex items-center justify-center">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <Textarea
                                placeholder="ถามคำถามเกี่ยวกับเนื้อหาหรือเรื่องที่สนใจ"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        if (message.trim() || attachment) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        } else {
                                            e.preventDefault();
                                        }
                                    }
                                }}
                                className="w-full min-h-[48px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 px-2 py-3 text-base md:text-lg shadow-none font-medium placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {/* Actions Area (Bottom) */}
                        <div className="flex items-center justify-between px-1 mb-1">
                            {/* Left: สร้างแชทใหม่ & แนบไฟล์ */}
                            <div className="flex items-center gap-1">
                                <div className={`transition-all duration-500 ease-in-out flex items-center justify-center ${isChatMode ? 'opacity-100 w-10' : 'opacity-0 w-0 overflow-hidden'}`}>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                                        onClick={handleNewChat}
                                        title="แชทใหม่"
                                    >
                                        <Plus size={20} />
                                    </Button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.md,.csv,.sql,.html,.css"
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-full h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                                    title="แนบไฟล์ข้อความ/โค้ด"
                                >
                                    <Paperclip size={20} />
                                </Button>
                            </div>

                            {/* Right: โมเดล & ปุ่มส่ง */}
                            <div className="flex items-center gap-1">
                                {/* Model Selector */}
                                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isTyping}>
                                    <SelectTrigger className="h-10 border-0 hover:bg-black/5 dark:hover:bg-white/10 rounded-full shrink-0 shadow-none focus:ring-0 transition-colors text-gray-600 dark:text-gray-300 px-4">
                                        <div className="flex items-center gap-1">
                                            <SelectValue defaultValue="llama-3.3-70b-versatile" placeholder="Llama 3.3 70B" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={3} className="rounded-xl shadow-lg border-gray-100 p-1">
                                        <SelectItem value="llama-3.3-70b-versatile" className="rounded-lg py-2.5 cursor-pointer text-sm font-medium focus:bg-blue-50 focus:text-blue-700 transition-colors">Llama 3.3 70B</SelectItem>
                                        <SelectItem value="llama-3.1-8b-instant" className="rounded-lg py-2.5 cursor-pointer text-sm font-medium focus:bg-blue-50 focus:text-blue-700 transition-colors">Llama 3.1 8B</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* ปุ่มกดส่ง */}
                                <div className="relative w-10 h-10 ml-1">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            stopTyping();
                                        }}
                                        className={`absolute inset-0 rounded-full h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white shrink-0 transition-all duration-300 ease-in-out ${isTyping ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90 pointer-events-none'}`}
                                    >
                                        <Square size={14} className="fill-current" />
                                    </Button>

                                    <Button
                                        type="submit"
                                        size="icon"
                                        variant="ghost"
                                        disabled={(!message.trim() && !attachment) || isTyping}
                                        className={`absolute inset-0 rounded-full h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white shrink-0 transition-all duration-300 ease-in-out ${!isTyping ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90 pointer-events-none'} disabled:opacity-50 disabled:bg-transparent disabled:text-gray-400 disabled:pointer-events-none`}
                                    >
                                        <Send size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}