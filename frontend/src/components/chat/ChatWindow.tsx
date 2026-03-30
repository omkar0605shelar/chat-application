import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, MoreHorizontal, Phone, Video, Search, ChevronLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addMessage } from '../../features/chat/chatSlice';

const MessageBubble: React.FC<{ message: any; isOwn: boolean }> = ({ message, isOwn }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}
    >
      <div className={`max-w-[70%] p-3 px-4 rounded-2xl ${
        isOwn 
          ? 'bg-gradient-to-br from-primary to-primary-soft text-white rounded-tr-none shadow-md shadow-primary/10' 
          : 'bg-white border border-primary/5 text-text-charcoal rounded-tl-none shadow-sm'
      }`}>
        {message.type === 'image' ? (
          <img src={message.content} alt="sent image" className="rounded-xl w-full h-auto cursor-pointer border border-white/20" />
        ) : (
          <p className="text-sm font-medium leading-relaxed">{message.content}</p>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-primary/30 font-bold uppercase">{message.time || '12:34 PM'}</span>
        {isOwn && (
          <span className="text-accent-coral ml-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17L4 12" />
            </svg>
          </span>
        )}
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

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(addMessage({
      id: Date.now().toString(),
      sender: user?.id || 'me',
      chatId: activeChat?.id || '',
      content: input,
      type: 'text',
      createdAt: new Date().toISOString(),
      seen: false
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
          <Avatar size="md" online={true} />
          <div>
            <h3 className="text-base font-bold text-text-charcoal leading-none">Omkar Shelar</h3>
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
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-white/60 border border-primary/5 text-[10px] font-bold text-primary/30 uppercase tracking-widest backdrop-blur-sm">Today</span>
          </div>
          
          <MessageBubble isOwn={false} message={{ content: "Yo! Have you seen the new NexTalk design system? It's literally built with glassmorphism!", type: 'text' }} />
          <MessageBubble isOwn={true} message={{ content: "Just saw it, looks fire 🔥 The animations are so smooth.", type: 'text' }} />
          <MessageBubble isOwn={false} message={{ content: "Check out this screenshot from the dev site.", type: 'text' }} />
          <MessageBubble isOwn={false} message={{ content: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop", type: 'image' }} />
          {messages.map(msg => (
            <MessageBubble key={msg.id} isOwn={msg.sender === user?.id} message={msg} />
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
