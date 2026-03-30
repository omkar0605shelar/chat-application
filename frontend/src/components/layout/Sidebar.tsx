import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, MessageSquare, Settings, LogOut, User as UserIcon } from 'lucide-react';
import Logo from '../ui/Logo';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { setActiveChat } from '../../features/chat/chatSlice';

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { chats, activeChat } = useAppSelector((state) => state.chat);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-[300px] h-full flex flex-col bg-white/40 backdrop-blur-3xl border-r border-primary/5 z-20 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2">
        <Logo size={32} showText={true} />
        
        <div className="mt-8 flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
          <Avatar name={user?.name} src={user?.avatar} online={true} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-charcoal truncate">{user?.name}</p>
            <p className="text-[10px] text-primary/40 font-medium truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mt-6">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-white/50 border-0 rounded-2xl pl-11 pr-4 text-sm text-text-charcoal placeholder:text-primary/20 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6 flex relative">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 pb-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'chats' ? 'text-primary' : 'text-primary/30'}`}
        >
          <MessageSquare size={16} />
          Chats
        </button>
        <button 
          onClick={() => setActiveTab('friends')}
          className={`flex-1 pb-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'friends' ? 'text-primary' : 'text-primary/30'}`}
        >
          <Users size={16} />
          Friends
        </button>
        
        {/* Animated Underline */}
        <motion.div 
          className="absolute bottom-0 h-1 bg-primary rounded-full w-1/2 -translate-x-1"
          animate={{ x: activeTab === 'chats' ? 0 : '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-1 custom-scrollbar">
        {activeTab === 'chats' ? (
          chats.map((chat) => (
            <motion.div 
              key={chat.id}
              whileHover={{ x: 4 }}
              onClick={() => dispatch(setActiveChat(chat))}
              className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                activeChat?.id === chat.id 
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary shadow-sm' 
                  : 'hover:bg-white/40'
              }`}
            >
              <Avatar size="sm" online={true} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-text-charcoal truncate">Omkar Shelar</p>
                  <span className="text-[10px] text-primary/30 mt-0.5">12:30 PM</span>
                </div>
                <p className="text-xs text-primary/40 truncate mt-0.5">Hey, did you see the new design? It looks really sweet!</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {chat.unseenCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {chat.unseenCount}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-primary/20">
            <Users size={40} className="mb-2 opacity-10" />
            <p className="text-xs font-medium">No friends found</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-primary/5 flex items-center justify-between">
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="p-2 rounded-xl hover:bg-white/60 text-primary/60 transition-colors"
          >
            <Settings size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="p-2 rounded-xl hover:bg-white/60 text-primary/60 transition-colors"
          >
            <UserIcon size={20} />
          </motion.button>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-coral/10 text-accent-coral font-bold text-xs hover:bg-accent-coral hover:text-white transition-all shadow-sm"
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
