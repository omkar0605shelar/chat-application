import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useAuthStore } from '../context/useAuthStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import type { ChatWithUser, Message } from '../types';
import { chatService } from '../services/chatService';
import { MessageCircle } from 'lucide-react';

const ChatPage: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<ChatWithUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?._id) {
            const socket = connectSocket(user._id);

            socket.on('getOnlineUsers', (users: string[]) => {
                setOnlineUsers(users);
            });

            socket.on('newMessage', (message: Message) => {
                if (selectedChat?.chat._id === message.chatId) {
                    setMessages((prev) => [...prev, message]);
                }
                // Refresh sidebar or chats list here if needed
            });

            socket.on('messagesSeen', ({ chatId, seenAt }: { chatId: string, seenAt: string }) => {
                if (selectedChat?.chat._id === chatId) {
                    setMessages((prev) =>
                        prev.map(msg => ({
                            ...msg,
                            seen: true,
                            seenAt: msg.seenAt || seenAt
                        }))
                    );
                }
            });

            socket.on('typing', ({ chatId, isTyping: typing }: { chatId: string, isTyping: boolean }) => {
                if (selectedChat?.chat._id === chatId) {
                    setIsTyping(typing);
                }
            });

            // Handle other socket events like typing...
        }

        return () => {
            disconnectSocket();
        };
    }, [user, selectedChat]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.chat._id);
        }
    }, [selectedChat]);

    const fetchMessages = async (chatId: string) => {
        try {
            const res = await chatService.getMessages(chatId);
            setMessages(res.data.messages);
        } catch (err) {
            console.error('Error fetching messages', err);
        }
    };

    const handleSendMessage = async (text: string, image?: File) => {
        if (!selectedChat) return;
        try {
            const res = await chatService.sendMessage(selectedChat.chat._id, text, image);
            setMessages((prev) => [...prev, res.data.message]);
        } catch (err) {
            console.error('Error sending message', err);
        }
    };

    return (
        <div className="flex w-full h-full">
            <Sidebar
                onlineUsers={onlineUsers}
                onSelectChat={setSelectedChat}
                selectedChatId={selectedChat?.chat._id}
            />
            {selectedChat ? (
                <ChatWindow
                    selectedChat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isTyping={isTyping}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-blue-100/50 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/20">
                        <MessageCircle className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a conversation</h2>
                    <p className="text-gray-500 max-w-sm">
                        Choose a contact from the sidebar or start a new conversation to begin chatting.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
