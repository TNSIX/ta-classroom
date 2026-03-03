'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, ThumbsUp, ThumbsDown, Copy, Square, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";


interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    isTyping?: boolean;
    feedback?: 'like' | 'dislike' | null;
}

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [isChatMode, setIsChatMode] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        // หยุดแชทก่อนหน้าถ้ากำลัง generate อยู่ แล้วเริ่มแชทใหม่
        if (isTyping) {
            stopTyping();
        }

        if (!message.trim()) return;

        setIsChatMode(true);
        // Add User Message
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: message };
        setMessages(prev => [...prev, userMsg]);

        console.log("Sending message:", message);
        setMessage("");

        // Simulate Bot Response with Typewriter Effect
        setTimeout(() => {
            const fullText = "รับทราบครับ เดี๋ยวผมจะลองตรวจสอบข้อมูลให้นะครับ มีอะไรให้ช่วยเพิ่มเติมไหมครับ?";

            setIsTyping(true);
            const botMsgId = (Date.now() + 1).toString();

            // Create empty bot message first
            setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: "", isTyping: true }]);

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
                    currentIndex++;
                }

            }, 20); // Adjust typing speed here (ms per char)
        }, 1000);
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
                            <h1 className="text-3xl font-black select-none text-gray-700">สวัสดีคุณ</h1>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 select-none">ADMIN</h2>

                        </div>
                        <h3 className="text-5xl font-black select-none text-gray-700">มีอะไรให้ช่วยไหม ?</h3>
                    </div>

                    {/* Chat Messages */}
                    {isChatMode && (
                        <div className="w-full flex-1 overflow-y-auto space-y-4 p-4 animate-in fade-in duration-500">
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl max-w-[80%] break-words shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                        }`}>
                                        {msg.text}
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

                {/* ส่วน Input + ปุ่มส่ง */}
                <div className={`w-full transition-all duration-700 ease-in-out ${isChatMode ? 'pb-12' : 'pb-[calc(50vh-40px)]'}`}>
                    <form onSubmit={handleSendMessage} className="flex w-full">
                        {/* New Chat Button */}
                        <div className={`transition-all duration-500 ease-in-out ${isChatMode ? 'opacity-100 w-12 mr-4' : 'opacity-0 w-0 overflow-hidden'}`}>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="rounded-full h-12 w-12 border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm"
                                onClick={handleNewChat}
                                title="แชทใหม่"
                            >
                                <Plus size={24} />
                            </Button>
                        </div>

                        {/* Input Area */}
                        <div className="flex-1  mr-4">
                            <Input
                                placeholder="ถามคำถามเกี่ยวกับเนื้อหาหรือเรื่องที่สนใจ"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full focus-visible:ring-blue-600 rounded-full p-6 shadow-sm border-gray-200"
                            />
                        </div>
                        {/* ปุ่มกดส่ง */}
                        <div className="relative w-12 h-12">
                            <Button
                                type="button"
                                size="icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    stopTyping();
                                }}
                                className={`absolute inset-0 bg-red-400 hover:bg-red-500 text-white rounded-full shrink-0 h-12 w-12 shadow-sm transition-all duration-300 ease-in-out ${isTyping ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90 pointer-events-none'}`}
                            >
                                <Square size={16} className="fill-current" />
                            </Button>

                            <Button
                                type="submit"
                                size="icon"
                                className={`absolute inset-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full shrink-0 h-12 w-12 shadow-sm transition-all duration-300 ease-in-out ${!isTyping ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90 pointer-events-none'}`}
                            >
                                <Send size={20} />
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}