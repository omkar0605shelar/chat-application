import { authService } from '../services/api';
import { chatService } from '../services/chatService';
import React from 'react';
import type { User, ChatWithUser } from '../types';
import { useAuthStore } from '../context/useAuthStore';
import { Search, MessageSquare, Users, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
    onSelectChat: (chat: ChatWithUser) => void;
    selectedChatId?: string;
    onlineUsers: string[];
    chats: ChatWithUser[];
    onRefreshChats: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectChat, selectedChatId, onlineUsers, chats, onRefreshChats }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
    const [search, setSearch] = useState('');
    const logout = useAuthStore((state) => state.logout);
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const handleCreateChat = async (userId: string) => {
        try {
            await chatService.createChat(userId);
            onRefreshChats();
            setActiveTab('chats');
            // Selection will be handled by the parent when chats are refreshed
        } catch (err) {
            console.error('Error creating chat', err);
        }
    };

    return (
        <div className="w-80 border-r border-white/20 flex flex-col h-full bg-white/10">
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
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chats' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/30 text-gray-600 hover:bg-white/50'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" /> Chats
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/30 text-gray-600 hover:bg-white/50'
                        }`}
                >
                    <Users className="w-4 h-4" /> Users
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {activeTab === 'chats' ? (
                    filteredChats.map((c) => (
                        <button
                            key={c.chat._id}
                            onClick={() => onSelectChat(c)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChatId === c.chat._id ? 'bg-blue-600/10 border border-blue-600/20' : 'hover:bg-white/40'
                                }`}
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
                ) : (
                    filteredUsers.map((u) => (
                        <button
                            key={u._id}
                            onClick={() => handleCreateChat(u._id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all"
                        >
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
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
