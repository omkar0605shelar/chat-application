import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import VideoCallOverlay from '../components/VideoCallOverlay';
import { useAuthStore } from '../context/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import type { ChatWithUser, Message } from '../types';
import { chatService } from '../services/chatService';
import { callService } from '../services/callService';
import { MessageCircle } from 'lucide-react';
import Peer from 'simple-peer';

const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<ChatWithUser[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatWithUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const user = useAuthStore((state) => state.user);
    const { setCallState, setLocalStream, setRemoteStream, setPeer, resetCall, peer: currentPeer } = useCallStore();

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

            // Video Call Listeners
            socket.on('call:offer', ({ from, signal, name }: { from: string, signal: Peer.SignalData, name: string }) => {
                setCallState({
                    status: 'receiving',
                    peerId: from,
                    peerName: name,
                    signal
                });
            });

            socket.on('call:answer', ({ signal }: { signal: Peer.SignalData }) => {
                if (currentPeer && (currentPeer as Peer.Instance).signal) {
                    (currentPeer as Peer.Instance).signal(signal);
                }
            });

            socket.on('call:end', () => {
                resetCall();
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

    const handleStartCall = async (isVideo: boolean) => {
        if (!selectedChat || !user) return;
        const socket = getSocket();
        if (!socket) return;

        try {
            const stream = await callService.getUserMedia(isVideo, true);
            setLocalStream(stream);
            setCallState({
                status: 'calling',
                peerId: selectedChat.user._id,
                peerName: selectedChat.user.name,
                isVideoOn: isVideo
            });

            const peer = callService.initiateCall(
                socket,
                selectedChat.user._id,
                stream,
                () => {
                    // Signal is sent by the service
                },
                (remoteStream) => {
                    setRemoteStream(remoteStream);
                    setCallState({ status: 'in-call' });
                },
                () => resetCall()
            );

            setPeer(peer);
        } catch (err) {
            console.error('Error starting call', err);
        }
    };

    const handleAnswerCall = async () => {
        const { peerId, signal: incomingSignal } = useCallStore.getState();
        const socket = getSocket();
        if (!socket || !peerId || !incomingSignal) return;

        try {
            const stream = await callService.getUserMedia(true, true);
            setLocalStream(stream);

            const peer = callService.answerCall(
                socket,
                peerId,
                incomingSignal as Peer.SignalData,
                stream,
                (remoteStream) => {
                    setRemoteStream(remoteStream);
                    setCallState({ status: 'in-call' });
                },
                () => resetCall()
            );

            setPeer(peer);
        } catch (err) {
            console.error('Error answering call', err);
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
                    onStartCall={handleStartCall}
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
            <VideoCallOverlay onAnswer={handleAnswerCall} />
        </div>
    );
};

export default ChatPage;
