import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useAuthStore } from '../context/useAuthStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import type { ChatWithUser, Message } from '../types';
import { chatService } from '../services/chatService';
import { MessageCircle } from 'lucide-react';

const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<ChatWithUser[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatWithUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const user = useAuthStore((state) => state.user);

    const fetchChats = async () => {
        try {
            const res = await chatService.getChats();
            setChats(res.data.chats);
        } catch (err) {
            console.error('Error fetching chats', err);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (user?._id) {
            const socket = connectSocket(user._id);

            socket.on('getOnlineUsers', (users: string[]) => {
                setOnlineUsers(users);
            });

            socket.on('newMessage', (message: Message) => {
                if (selectedChat?.chat._id === message.chatId) {
                    setMessages((prev) => [...prev, message]);
                    // If we are already in the chat, mark it as read immediately
                    chatService.markAsRead(message.chatId);
                } else {
                    // Update unseen count in sidebar
                    setChats((prev) =>
                        prev.map((c) => {
                            if (c.chat._id === message.chatId) {
                                return {
                                    ...c,
                                    chat: {
                                        ...c.chat,
                                        unseenCount: c.chat.unseenCount + 1,
                                        latestMessage: {
                                            text: message.text,
                                            sender: message.sender,
                                        },
                                        updatedAt: new Date().toISOString(),
                                    },
                                };
                            }
                            return c;
                        }).sort((a, b) => new Date(b.chat.updatedAt).getTime() - new Date(a.chat.updatedAt).getTime())
                    );
                }
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
        }

        return () => {
            disconnectSocket();
        };
    }, [user, selectedChat]);

    const handleSelectChat = async (chatWithUser: ChatWithUser) => {
        setSelectedChat(chatWithUser);

        // Mark as read immediately in UI
        setChats((prev) =>
            prev.map((c) =>
                c.chat._id === chatWithUser.chat._id
                    ? { ...c, chat: { ...c.chat, unseenCount: 0 } }
                    : c
            )
        );

        // Call API
        try {
            await chatService.markAsRead(chatWithUser.chat._id);
        } catch (err) {
            console.error('Error marking as read', err);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.chat._id);
        }
    }, [selectedChat?.chat._id]);

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
            const newMessage = res.data.message;
            setMessages((prev) => [...prev, newMessage]);

            // Update latest message in sidebar
            setChats((prev) =>
                prev.map((c) =>
                    c.chat._id === selectedChat.chat._id
                        ? {
                            ...c,
                            chat: {
                                ...c.chat,
                                latestMessage: {
                                    text: newMessage.text,
                                    sender: newMessage.sender,
                                },
                                updatedAt: new Date().toISOString(),
                            },
                        }
                        : c
                ).sort((a, b) => new Date(b.chat.updatedAt).getTime() - new Date(a.chat.updatedAt).getTime())
            );
        } catch (err) {
            console.error('Error sending message', err);
        }
    };

    return (
        <div className="flex w-full h-full">
            <Sidebar
                onlineUsers={onlineUsers}
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChat?.chat._id}
                chats={chats}
                onRefreshChats={fetchChats}
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
