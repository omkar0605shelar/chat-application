import React from 'react';
import type { Message } from '../types';
import { useAuthStore } from '../context/useAuthStore';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const currentUser = useAuthStore((state) => state.user);
    const isMe = message.sender === currentUser?._id;

    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-lg relative ${isMe
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/20'
                    : 'bg-white/10 backdrop-blur-xl text-gray-100 rounded-tl-none border border-white/10'
                    }`}
            >
                {message.messageType === 'image' && message.image && (
                    <img src={message.image.url} alt="Shared" className="rounded-lg mb-2 max-h-60 w-full object-cover" />
                )}
                <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    <span className="text-[10px]">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        message.seen ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
