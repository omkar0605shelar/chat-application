import React, { useEffect, useRef, useState } from 'react';
import type { Message, ChatWithUser } from '../types';
import MessageBubble from './MessageBubble';
import { Send, Image as ImageIcon, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../services/socket';

interface ChatWindowProps {
    selectedChat: ChatWithUser;
    messages: Message[];
    onSendMessage: (text: string, image?: File) => void;
    onStartCall: (isVideo: boolean) => void;
    isTyping: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat, messages, onSendMessage, onStartCall, isTyping }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !selectedChat) return;

        if (text) {
            socket.emit('typing', {
                chatId: selectedChat.chat._id,
                receiverId: selectedChat.user._id,
                isTyping: true,
            });
        }

        const timeout = setTimeout(() => {
            socket.emit('typing', {
                chatId: selectedChat.chat._id,
                receiverId: selectedChat.user._id,
                isTyping: false,
            });
        }, 2000);

        return () => clearTimeout(timeout);
    }, [text, selectedChat]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text && !image) return;
        onSendMessage(text, image || undefined);
        setText('');
        setImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border-l border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/20">
                            {selectedChat.user.name[0].toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-tight">{selectedChat.user.name}</h3>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Active Now</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onStartCall(false)}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onStartCall(true)}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <MessageBubble message={msg} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-2xl rounded-tl-none border border-white/20">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="p-4 bg-white/30 border-t border-white/20 relative">
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-lg" />
                    <button
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                    >
                        <ImageIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                    />
                    
                    <div className="flex-1 relative flex items-center">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Message..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        />
                        <button type="button" className="absolute right-3 p-1.5 text-gray-400 hover:text-yellow-400 transition-colors">
                            <Smile className="w-6 h-6" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!text && !image}
                        className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
