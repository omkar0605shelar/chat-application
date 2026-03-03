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
    isTyping: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat, messages, onSendMessage, isTyping }) => {
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
        <div className="flex-1 flex flex-col h-full bg-white/5 backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {selectedChat.user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{selectedChat.user.name}</h3>
                        <p className="text-xs text-gray-500">{selectedChat.user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                    <button className="hover:text-blue-600 transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="hover:text-blue-600 transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="hover:text-blue-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
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
            <form onSubmit={handleSend} className="p-4 border-t border-white/20 bg-white/20">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-white/40 rounded-full transition-all"
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
                    <button type="button" className="p-2 text-gray-500 hover:bg-white/40 rounded-full transition-all">
                        <Smile className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/50 border border-white/30 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
