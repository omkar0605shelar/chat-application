import { authService } from '../services/api';
import { chatService } from '../services/chatService';
import { friendService } from '../services/friendService';
import React, { useState, useEffect } from 'react';
import type { User, ChatWithUser } from '../types';
import { useAuthStore } from '../context/useAuthStore';
import { useFriendStore } from '../store/useFriendStore';
import { Search, MessageSquare, Users, LogOut, UserPlus, Check, X as CloseX, Mail } from 'lucide-react';

interface SidebarProps {
    onSelectChat: (chat: ChatWithUser) => void;
    selectedChatId?: string;
    onlineUsers: string[];
    chats: ChatWithUser[];
    onRefreshChats: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat, selectedChatId, onlineUsers, chats, onRefreshChats }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'friends'>('chats');
    const [search, setSearch] = useState('');
    const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
    
    const logout = useAuthStore((state) => state.logout);
    const { friends, pendingRequests, setFriends, setPendingRequests, removePendingRequest } = useFriendStore();
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchUsers();
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                friendService.getFriends(),
                friendService.getPendingRequests()
            ]);
            setFriends(friendsRes.data);
            setPendingRequests(requestsRes.data);
        } catch (err) {
            console.error('Error fetching friends', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersRes = await authService.getAllUsers();
            setUsers(usersRes.data.users.filter((u: User) => u._id !== currentUser?._id));
        } catch (err) {
            console.error('Error fetching users', err);
        }
    };

    const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
    const filteredChats = chats.filter((c) => c.user.name.toLowerCase().includes(search.toLowerCase()));

    const handleSendRequest = async (email: string) => {
        try {
            await friendService.sendInvite(email);
            // Show success toast here if available
            alert('Friend request sent via email!');
        } catch (err) {
            console.error('Error sending friend request', err);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        const otp = otpInput[requestId];
        if (!otp) {
            alert('Please enter the OTP received in email');
            return;
        }
        try {
            await friendService.acceptInvite(otp);
            removePendingRequest(requestId);
            fetchFriends();
            setOtpInput(prev => {
                const updated = { ...prev };
                delete updated[requestId];
                return updated;
            });
        } catch (err) {
            console.error('Error accepting request', err);
            alert('Invalid OTP');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await friendService.rejectRequest(requestId);
            removePendingRequest(requestId);
        } catch (err) {
            console.error('Error rejecting request', err);
        }
    };

    return (
        <div className="w-80 border-r border-white/20 flex flex-col h-full bg-white/10 backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                <button onClick={logout} className="p-2 hover:bg-red-100/50 rounded-lg text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chats' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/30 text-gray-600 hover:bg-white/50'}`}
                >
                    <MessageSquare className="w-4 h-4" /> Chats
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/30 text-gray-600 hover:bg-white/50'}`}
                >
                    <Users className="w-4 h-4" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'friends' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/30 text-gray-600 hover:bg-white/50'}`}
                >
                    <UserPlus className="w-4 h-4" /> Friends
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-white">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                {activeTab === 'chats' ? (
                    filteredChats.map((c) => (
                        <button
                            key={c.chat._id}
                            onClick={() => onSelectChat(c)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChatId === c.chat._id ? 'bg-blue-600/10 border border-blue-600/20' : 'hover:bg-white/40'}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                                    {c.user.name[0].toUpperCase()}
                                </div>
                                {onlineUsers.includes(c.user._id) && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800 line-clamp-1">{c.user.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {c.chat.latestMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                            {c.chat.unseenCount > 0 && (
                                <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {c.chat.unseenCount}
                                </div>
                            )}
                        </button>
                    ))
                ) : activeTab === 'users' ? (
                    filteredUsers.map((u) => (
                        <div key={u._id} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-lg">
                                    {u.name[0].toUpperCase()}
                                </div>
                                {onlineUsers.includes(u._id) && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                            <button
                                onClick={() => handleSendRequest(u.email)}
                                className="p-2 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500"
                                title="Send Friend Request"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="space-y-4 pt-2">
                        {pendingRequests.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-3">Pending Requests</h3>
                                <div className="space-y-2">
                                    {pendingRequests.map((req) => (
                                        <div key={req._id} className="p-3 bg-white/40 rounded-xl border border-white/20 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                                                    {req.from.name[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{req.from.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {req.from.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter OTP"
                                                    value={otpInput[req._id] || ''}
                                                    onChange={(e) => setOtpInput({ ...otpInput, [req._id]: e.target.value })}
                                                    className="flex-1 bg-white/50 border border-white/30 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleAcceptRequest(req._id)}
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                                    title="Accept"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req._id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                                    title="Reject"
                                                >
                                                    <CloseX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-3">My Friends</h3>
                            {friends.length > 0 ? (
                                <div className="space-y-1">
                                    {friends.map((f) => (
                                        <button
                                            key={f._id}
                                            onClick={() => {
                                                chatService.createChat(f._id).then(() => {
                                                    onRefreshChats();
                                                    setActiveTab('chats');
                                                });
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all border border-transparent hover:border-white/20 shadow-sm hover:shadow-md"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                                    {f.name[0].toUpperCase()}
                                                </div>
                                                {onlineUsers.includes(f._id) && (
                                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold text-gray-800 text-sm">{f.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(f._id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <p className="text-[10px] text-gray-500 font-medium">{onlineUsers.includes(f._id) ? 'Online' : 'Offline'}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white/20 rounded-2xl border border-white/10 mt-2">
                                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-3 opacity-50" />
                                    <p className="text-xs text-gray-400 font-medium italic">No friends yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
