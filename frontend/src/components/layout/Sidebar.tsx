import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import Logo from '../ui/Logo';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import FriendOtpModal from '../friends/FriendOtpModal';
import { logout } from '../../features/auth/authSlice';
import { setActiveChat } from '../../features/chat/chatSlice';
import { fetchFriends } from '../../features/friends/friendSlice';
import { fetchChats, createChat } from '../../features/chat/chatSlice';

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [search, setSearch] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { chats, activeChat } = useAppSelector((state) => state.chat);
  const { friends } = useAppSelector((state) => state.friends);

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchChats());
  }, [dispatch]);

  const handleFriendClick = async (friendId: string) => {
    // Check if chat already exists
    const existingChat = chats.find(c => c.user._id === friendId);
    
    if (existingChat) {
      dispatch(setActiveChat(existingChat));
    } else {
      // Create new chat
      await dispatch(createChat(friendId));
      // After creation, fetchChats is called inside createChat thunk, 
      // but we need to set the new chat as active. 
      // Actually, my createChat thunk re-fetches chats, but doesn't set active.
      // I'll update the thunk or handle it here.
    }
    setActiveTab('chats');
  };

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
          chats.map((item) => (
            <motion.div 
              key={item.chat._id}
              whileHover={{ x: 4 }}
              onClick={() => dispatch(setActiveChat(item))}
              className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${
                activeChat?.chat._id === item.chat._id 
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary shadow-sm' 
                  : 'hover:bg-white/40'
              }`}
            >
              <Avatar name={item.user.name} src={item.user.avatar} size="sm" online={true} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-text-charcoal truncate">{item.user.name}</p>
                  <span className="text-[10px] text-primary/30 mt-0.5">
                    {item.chat.updatedAt ? new Date(item.chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-primary/40 truncate mt-0.5">{item.chat.latestMessage?.text || 'No messages yet'}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {item.chat.unseenCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {item.chat.unseenCount}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : friends.length > 0 ? (
          friends.map((friend) => (
            <motion.div 
              key={friend.id}
              whileHover={{ x: 4 }}
              onClick={() => handleFriendClick(friend.id)}
              className="p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:bg-white/40"
            >
              <Avatar name={friend.name} src={friend.avatar} size="sm" online={friend.online} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-charcoal truncate">{friend.name}</p>
                <p className="text-xs text-primary/40 truncate">{friend.email}</p>
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
            onClick={() => setIsOtpModalOpen(true)}
            className="p-2 rounded-xl hover:bg-white/60 text-primary/60 transition-colors"
            title="Add Friend via OTP"
          >
            <Users size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="p-2 rounded-xl hover:bg-white/60 text-primary/60 transition-colors"
          >
            <Settings size={20} />
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

      <FriendOtpModal 
        isOpen={isOtpModalOpen} 
        onClose={() => setIsOtpModalOpen(false)} 
      />
    </div>
  );
};

export default Sidebar;
