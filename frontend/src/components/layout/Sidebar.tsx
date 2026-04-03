import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Users, MessageSquare, Settings, LogOut, 
  Plus, UserPlus, Bell, Bot, Send, Loader2, Check,
  QrCode, Clipboard, RefreshCw
} from 'lucide-react';
import Logo from '../ui/Logo';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import NotificationCenter from '../ui/NotificationCenter';
import ProfileSettingsModal from '../profile/ProfileSettingsModal';
import { useChatStore } from '../../store/useChatStore';
import { useFriendStore } from '../../store/useFriendStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { friendService } from '../../services/friendService';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'add'>(
    location.pathname === '/friends' ? 'friends' : 
    location.pathname === '/ai-assistant' ? 'chats' : 'chats'
  );
  const [search, setSearch] = useState('');
  const [joinOtp, setJoinOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const { chats, activeChat, setActiveChat, onlineUsers } = useChatStore();
  const { friends, setFriends, pendingRequests } = useFriendStore();
  const { notifications } = useNotificationStore();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleGenerateOtp = async () => {
    setGenerating(true);
    try {
      const otp = await friendService.generateJoinOtp();
      setGeneratedOtp(otp);
      toast.success('Join code generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const handleJoinOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinOtp) return;
    setLoading(true);
    try {
      await friendService.joinWithOtp(joinOtp);
      toast.success('Friend added successfully!');
      setJoinOtp('');
      setActiveTab('friends');
      // Trigger friends refresh
      const updatedFriends = await friendService.getFriends();
      setFriends(updatedFriends);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(c => 
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFriends = friends.filter(f => 
    (f.name || f._id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex bg-white/50 backdrop-blur-3xl border-r border-primary/12 z-20 overflow-hidden">
      {/* Left Icon Rail */}
      <div className="w-20 h-full flex flex-col items-center py-8 bg-white/45 border-r border-primary/12">
        <Logo size={32} showText={false} className="mb-10" />
        
        <div className="flex-1 flex flex-col gap-6">
          <RailIcon 
            key="rail-messages"
            icon={MessageSquare} 
            active={activeTab === 'chats' && !location.pathname.startsWith('/ai-assistant')} 
            onClick={() => {
              setActiveTab('chats');
              navigate('/');
            }} 
            badge={chats.reduce((acc, c) => acc + (c.chat.unseenCount || 0), 0)}
          />
          <RailIcon 
            key="rail-friends"
            icon={Users} 
            active={activeTab === 'friends' || activeTab === 'add' || location.pathname === '/friends'} 
            onClick={() => {
              setActiveTab('friends');
              navigate('/friends');
            }} 
            badge={pendingRequests.length}
          />
          <RailIcon 
            key="rail-ai"
            icon={Bot} 
            active={location.pathname === '/ai-assistant'} 
            onClick={() => {
              navigate('/ai-assistant');
            }} 
          />
          <NotificationCenter key="rail-notifications" />
        </div>

        <div className="flex flex-col gap-6 mt-auto">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-2xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
          >
            <Settings size={24} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-3 rounded-2xl hover:bg-accent-coral/5 text-accent-coral/40 hover:text-accent-coral transition-all"
          >
            <LogOut size={24} />
          </button>
          <div className="relative pt-4">
            <Avatar 
              key={user?.avatar?.url || 'no-avatar'}
              src={user?.avatar?.url} 
              name={user?.name} 
              size="md" 
              online={true} 
              className="cursor-pointer hover:ring-2 ring-primary ring-offset-2 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Sidebar Content */}
      <div className="w-[320px] h-full flex flex-col">
        {/* Header & Search */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-text-charcoal tracking-tight">
              {activeTab === 'chats' ? 'Messages' : activeTab === 'friends' ? 'Friends' : 'Add Friend'}
            </h2>
            <button className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
              <Plus size={20} />
            </button>
          </div>

          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-white/50 border-0 rounded-2xl pl-12 pr-4 text-sm font-medium text-text-charcoal placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tab Sub-navigation */}
        {(activeTab === 'friends' || activeTab === 'add') && (
          <div className="px-6 flex gap-4 mb-4">
            <button 
              onClick={() => setActiveTab('friends')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'friends' ? 'text-primary border-primary' : 'text-primary/30 border-transparent'}`}
            >
              All Friends
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'add' ? 'text-primary border-primary' : 'text-primary/30 border-transparent'}`}
            >
              Add New
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'chats' && (
              <motion.div 
                key="chats"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1"
              >
                {filteredChats.length === 0 ? (
                  <div key="empty-chats" className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center mb-4">
                      <MessageSquare size={24} className="text-primary/20" />
                    </div>
                    <p className="text-xs font-bold text-text-charcoal/40 uppercase tracking-widest">No messages yet</p>
                  </div>
                ) : (
                  filteredChats.map((item) => (
                    <ChatListItem 
                      key={item.chat._id} 
                      item={item} 
                      active={activeChat?.chat._id === item.chat._id}
                      onClick={() => {
                        setActiveChat(item);
                        navigate(`/friend/${item.user._id}`);
                      }}
                      isOnline={onlineUsers.includes(item.user._id)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'friends' && (
              <motion.div 
                key="friends"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1"
              >
                {filteredFriends.length === 0 ? (
                  <div key="empty-friends" className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center mb-4">
                      <Users size={24} className="text-primary/20" />
                    </div>
                    <p className="text-xs font-bold text-text-charcoal/40 uppercase tracking-widest">No friends yet</p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <FriendListItem 
                      key={friend._id} 
                      friend={friend} 
                      isOnline={onlineUsers.includes(friend._id)}
                      onChat={() => {
                        navigate(`/friend/${friend._id}`);
                      }}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div 
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2 space-y-6"
              >
                {/* Section 1: Generate Code */}
                <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/15 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-charcoal">Your Join Code</h4>
                    <p className="text-xs text-text-charcoal/40 font-medium mt-1">
                      Share this code with a friend so they can add you.
                    </p>
                  </div>
                  
                  {generatedOtp ? (
                    <div className="flex flex-col gap-3">
                      <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <span className="text-2xl font-black tracking-[0.2em] text-primary">{generatedOtp}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedOtp);
                            toast.success('Copied to clipboard!');
                          }}
                          className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Clipboard size={20} />
                        </button>
                      </div>
                      <button 
                        onClick={handleGenerateOtp}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2 hover:underline"
                      >
                        <RefreshCw size={12} /> Generate New Code
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateOtp}
                      disabled={generating}
                      className="w-full h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-soft transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {generating ? <Loader2 size={18} className="animate-spin" /> : 'Generate My Code'}
                    </button>
                  )}
                </div>

                {/* Section 2: Join via Code */}
                <form onSubmit={handleJoinOtp} className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-charcoal">Join via Code</h4>
                    <p className="text-xs text-text-charcoal/40 font-medium mt-1">
                      Paste a friend's code here to add them instantly.
                    </p>
                  </div>
                  <div className="relative group">
                    <QrCode size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={joinOtp}
                      onChange={(e) => setJoinOtp(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="w-full h-12 bg-white border-0 rounded-2xl pl-12 pr-4 text-sm font-black tracking-widest text-text-charcoal focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || joinOtp.length < 6}
                    className="w-full h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-soft transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Add Friend'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

const RailIcon = ({ icon: Icon, active, onClick, badge }: any) => (
  <button 
    onClick={onClick}
    className={`relative p-3 rounded-2xl transition-all group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/40 hover:bg-primary/5 hover:text-primary'}`}
  >
    <Icon size={24} />
    {badge > 0 && (
      <div className="absolute -top-1 -right-1">
        <Badge count={badge} />
      </div>
    )}
  </button>
);

const ChatListItem = ({ item, active, onClick, isOnline }: any) => (
  <motion.div 
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all ${
      active 
        ? 'bg-white shadow-xl shadow-primary/5 border border-primary/5' 
        : 'hover:bg-white/40'
    }`}
  >
    <div className="relative flex-shrink-0">
      <Avatar name={item.user.name} src={item.user.avatar?.url} size="md" online={isOnline} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <p className={`text-sm font-bold truncate ${active ? 'text-text-charcoal' : 'text-text-charcoal/80'}`}>
          {item.user.name}
        </p>
        <span className="text-[10px] font-bold text-primary/30 uppercase tracking-tighter">
          {item.chat.updatedAt ? new Date(item.chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {item.chat.latestMessage?.sender === item.user._id ? null : <Check size={12} className="text-primary/40" />}
        <p className="text-xs text-primary/40 truncate font-medium">
          {item.chat.latestMessage?.text || 'Start a conversation'}
        </p>
      </div>
    </div>
    {item.chat.unseenCount > 0 && (
      <div className="flex-shrink-0">
        <Badge count={item.chat.unseenCount} />
      </div>
    )}
  </motion.div>
);

const FriendListItem = ({ friend, isOnline, onChat }: any) => (
  <motion.div 
    whileHover={{ x: 4 }}
    className="p-4 rounded-3xl flex items-center gap-4 hover:bg-white/40 group transition-all"
  >
    <Avatar name={friend.name || friend._id} src={friend.avatar?.url} size="md" online={isOnline} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-text-charcoal truncate">{friend.name || 'Anonymous User'}</p>
      <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">
        {isOnline ? 'Active Now' : 'Offline'} • ID: {friend._id?.slice(-6).toUpperCase()}
      </p>
    </div>
    <button 
      onClick={onChat}
      className="p-2.5 rounded-xl bg-primary/5 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all"
    >
      <MessageSquare size={18} />
    </button>
  </motion.div>
);

export default Sidebar;
