import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, MoreHorizontal, Phone, Video, Search } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMessages, sendMessageToBackend } from '../../features/chat/chatSlice';

const MessageBubble: React.FC<{ message: any; isOwn: boolean }> = ({ message, isOwn }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4 w-full`}
    >
      <div className={`max-w-[75%] p-3 px-4 rounded-2xl relative shadow-sm ${
        isOwn 
          ? 'bg-[#DCF8C6] text-[#303030] rounded-tr-none border-l-4 border-l-[#7C5CBF]/10' 
          : 'bg-white border border-primary/5 text-text-charcoal rounded-tl-none'
      }`}>
        {message.messageType === 'image' || message.type === 'image' ? (
          <img src={message.image?.url || message.content} alt="sent image" className="rounded-xl w-full h-auto cursor-pointer border border-white/20" />
        ) : (
          <p className="text-sm font-medium leading-relaxed">{message.text || message.content}</p>
        )}
        
        <div className={`flex items-center gap-1 mt-1 justify-end`}>
          <span className="text-[9px] text-[#919191] font-bold uppercase">
            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:34 PM'}
          </span>
          {isOwn && (
            <span className="text-[#53bdeb] ml-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17L4 12" />
                <path d="M16 6L7.5 14.5" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChatWindow: React.FC = () => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeChat, messages } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat.chat._id));
    }
  }, [activeChat, dispatch]);

  const handleSend = () => {
    if (!input.trim() || !activeChat) return;
    dispatch(sendMessageToBackend({
      chatId: activeChat.chat._id,
      text: input
    }));
    setInput('');
  };

  if (!activeChat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-bg-soft/50 z-10 transition-all">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-charcoal opacity-40">Select a chat to start talking 👋</h2>
          <p className="text-sm text-primary/30 mt-2 font-medium">Join the vibe with NexTalk</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white/30 backdrop-blur-3xl z-10 overflow-hidden">
      {/* Top Bar */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-primary/5 bg-white/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Avatar name={activeChat.user.name} src={activeChat.user.avatar} size="md" online={true} />
          <div>
            <h3 className="text-base font-bold text-text-charcoal leading-none">{activeChat.user.name}</h3>
            <span className="text-xs text-emerald-400 font-bold mt-1 block">Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-primary/5 text-primary/40 transition-all"><Search size={20} /></button>
          <button className="p-2.5 rounded-full hover:bg-primary/5 text-primary/40 transition-all"><Phone size={20} /></button>
          <button className="p-2.5 rounded-full hover:bg-primary/5 text-primary/40 transition-all"><Video size={20} /></button>
          <button className="p-2.5 rounded-full hover:bg-primary/5 text-primary/40 transition-all ml-2"><MoreHorizontal size={22} /></button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent"
      >
        <div className="flex flex-col py-4">
          {messages.length === 0 ? (
            <div className="text-center my-10">
              <p className="text-sm text-primary/30 font-medium">Start the conversation with {activeChat.user.name} ✨</p>
            </div>
          ) : (
            <div className="text-center mb-8">
              <span className="px-4 py-1.5 rounded-full bg-white/60 border border-primary/5 text-[10px] font-bold text-primary/30 uppercase tracking-widest backdrop-blur-sm">Messages</span>
            </div>
          )}
          
          {messages.map(msg => (
            <MessageBubble key={msg._id || msg.id} isOwn={msg.sender === user?._id} message={msg} />
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-6 pt-2 pb-8 bg-white/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto relative group">
          <div className="glass rounded-[24px] p-2 pr-3 flex items-center gap-2 shadow-2xl border-white/60 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <div className="flex gap-1 ml-1">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-3 text-accent-coral hover:bg-accent-coral/10 rounded-2xl transition-all"
              >
                <ImageIcon size={22} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-3 text-primary/60 hover:bg-primary/10 rounded-2xl transition-all"
              >
                <Smile size={22} />
              </motion.button>
            </div>
            
            <input 
              type="text" 
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 text-sm font-medium py-3 px-2 text-text-charcoal placeholder:text-primary/20"
            />

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-soft text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
