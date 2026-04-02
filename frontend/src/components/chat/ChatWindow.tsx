import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Smile, MoreVertical, 
  Phone, Video, Search, X, ChevronLeft, Loader2,
  Paperclip, Mic, Reply, Bot, MessageSquare
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import EmojiPicker from '../ui/EmojiPicker';
import { useChatStore } from '../../store/useChatStore';
import { useCallStore } from '../../store/useCallStore';
import { useAppSelector } from '../../app/hooks';
import { chatApi } from '../../api/axios';
import toast from 'react-hot-toast';
import type { Message } from '../../types';

const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => {
  const [showReactions, setShowReactions] = useState(false);
  const { addReaction } = useChatStore();
  const { user } = useAppSelector((state) => state.auth);

  const handleReaction = (emoji: string) => {
    if (!user?._id) return;
    addReaction(message._id, emoji, user._id);
    setShowReactions(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-6 w-full group relative`}
    >
      <div className="flex items-end gap-2 max-w-[80%]">
        {!isOwn && (
          <Avatar name="Sender" size="sm" className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <div className="relative">
          <div className={`
            p-4 rounded-3xl relative shadow-sm transition-all
            ${isOwn 
              ? 'bg-primary text-white rounded-tr-none' 
              : 'bg-white border border-primary/5 text-text-charcoal rounded-tl-none'}
          `}>
            {message.type === 'image' ? (
              <div className="space-y-2">
                <img 
                  src={message.image?.url || message.content} 
                  alt="sent image" 
                  className="rounded-2xl w-full h-auto cursor-pointer border border-white/20 max-w-[300px] hover:opacity-90 transition-opacity" 
                />
                {message.text && <p className="text-sm font-medium leading-relaxed px-1">{message.text}</p>}
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed">{message.text || message.content}</p>
            )}
            
            <div className={`flex items-center gap-1.5 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isOwn ? 'text-white/60' : 'text-text-charcoal/30'}`}>
                {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  <CheckIcon seen={message.seen} />
                </div>
              )}
            </div>
          </div>

          {/* Reactions Display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`absolute -bottom-3 ${isOwn ? 'right-0' : 'left-0'} flex -space-x-1`}>
              {message.reactions.map((r, i) => (
                <motion.div
                  key={`${r.emoji}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-full px-1.5 py-0.5 text-xs shadow-sm border border-primary/10 flex items-center gap-1"
                >
                  {r.emoji}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Message Actions - Hover only */}
        <div className={`
          flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
          ${isOwn ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <button 
            onClick={() => setShowReactions(!showReactions)}
            className="p-2 rounded-xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
          >
            <Smile size={18} />
          </button>
          <button className="p-2 rounded-xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all">
            <Reply size={18} />
          </button>
        </div>
      </div>

      {/* Inline Reaction Picker */}
      <AnimatePresence>
        {showReactions && (
          <div className={`absolute z-20 bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'}`}>
            <EmojiPicker 
              isOpen={showReactions} 
              onClose={() => setShowReactions(false)} 
              onSelect={handleReaction}
              className="!relative !bottom-0 !mb-0"
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CheckIcon = ({ seen }: { seen?: boolean }) => (
  <div className="flex items-center">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={seen ? "text-white" : "text-white/40"}>
      <path d="M20 6L9 17L4 12" />
      {seen && <path d="M16 6L7.5 14.5" className="translate-x-1" />}
    </svg>
  </div>
);

const ChatWindow: React.FC = () => {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeChat, messages, setActiveChat, addMessage, setMessages, typingUsers } = useChatStore();
  const { user } = useAppSelector((state) => state.auth);
  const { initiateCall } = useCallStore();

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchMsgs = async () => {
      if (activeChat) {
        setLoading(true);
        try {
          const res = await chatApi.get(`/message/${activeChat.chat._id}`);
          setMessages(res.data.messages);
        } catch (err) {
          toast.error('Failed to load messages');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMsgs();
  }, [activeChat, setMessages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large (max 5MB)');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || !activeChat) return;

    const formData = new FormData();
    formData.append('chatId', activeChat.chat._id);
    if (input.trim()) formData.append('text', input.trim());
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await chatApi.post('/message/send', formData);
      addMessage(res.data.message);
      setInput('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-bg-soft/30 z-10 p-12 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-32 h-32 rounded-[48px] bg-primary/5 flex items-center justify-center mx-auto mb-10 group">
            <Bot size={64} className="text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500" />
          </div>
          <h2 className="text-3xl font-black text-text-charcoal tracking-tight">Your Inbox is Ready</h2>
          <p className="text-text-charcoal/40 font-medium mt-4 leading-relaxed">
            Select a conversation from the sidebar to start chatting, or add a new friend to begin your vibe.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white border border-primary/5 text-xs font-bold text-primary/40 uppercase tracking-widest shadow-sm">
              End-to-End Encrypted
            </div>
            <div className="px-4 py-2 rounded-full bg-white border border-primary/5 text-xs font-bold text-primary/40 uppercase tracking-widest shadow-sm">
              Real-time Sync
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isTyping = (typingUsers[activeChat.chat._id] || []).length > 0;

  return (
    <div className="flex-1 h-full flex flex-col bg-white relative z-10 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 flex items-center justify-between glass-dark border-b border-primary/5 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveChat(null)}
            className="lg:hidden p-2 rounded-xl hover:bg-primary/5 text-text-charcoal/40"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="relative">
            <Avatar name={activeChat.user.name} src={activeChat.user.avatar?.url} size="md" online={true} />
          </div>
          <div>
            <h3 className="text-lg font-black text-text-charcoal tracking-tight">{activeChat.user.name}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Now</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-3 rounded-2xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all">
            <Search size={20} />
          </button>
          <button 
            onClick={() => initiateCall(activeChat.user, 'audio')}
            className="p-3 rounded-2xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
          >
            <Phone size={20} />
          </button>
          <button 
            onClick={() => initiateCall(activeChat.user, 'video')}
            className="p-3 rounded-2xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
          >
            <Video size={20} />
          </button>
          <button className="p-3 rounded-2xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-2 custom-scrollbar bg-bg-soft/20"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm font-bold text-primary/30 uppercase tracking-widest">Loading Conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12">
            <div className="w-20 h-20 rounded-[32px] bg-primary/5 flex items-center justify-center mb-6">
              <MessageSquare size={32} className="text-primary/20" />
            </div>
            <p className="text-text-charcoal/40 font-bold">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
            
            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-8">
                    <span className="px-4 py-1.5 rounded-full bg-white border border-primary/5 text-[10px] font-black text-primary/40 uppercase tracking-widest shadow-sm">
                      {new Date(msg.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} isOwn={msg.sender === user?._id} />
              </React.Fragment>
            );
          })
        )}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-primary/5 w-fit"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
            </div>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Typing...</p>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0 z-20">
        <AnimatePresence>
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="p-4 glass rounded-3xl mb-4 flex items-center gap-4 relative"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/10">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-charcoal">{imageFile?.name}</p>
                <p className="text-xs text-text-charcoal/40">{(imageFile!.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="p-2 rounded-xl hover:bg-accent-coral/10 text-accent-coral transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative glass p-2 rounded-[32px] flex items-center gap-2 border border-primary/10 shadow-2xl">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-3 rounded-2xl transition-all ${showEmojiPicker ? 'bg-primary text-white' : 'text-primary/40 hover:bg-primary/5 hover:text-primary'}`}
            >
              <Smile size={24} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl text-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
            >
              <Paperclip size={24} />
            </button>
          </div>

          <input 
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-12 bg-transparent border-0 text-sm font-medium text-text-charcoal placeholder:text-primary/20 focus:ring-0"
          />

          <button className="p-3 rounded-2xl text-primary/40 hover:bg-primary/5 hover:text-primary transition-all">
            <Mic size={24} />
          </button>

          <button 
            onClick={handleSend}
            disabled={!input.trim() && !imageFile}
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg
              ${(input.trim() || imageFile) ? 'bg-primary text-white shadow-primary/20 scale-105 active:scale-95' : 'bg-primary/5 text-primary/20'}
            `}
          >
            <Send size={24} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          <EmojiPicker 
            isOpen={showEmojiPicker} 
            onClose={() => setShowEmojiPicker(false)} 
            onSelect={(emoji) => setInput(prev => prev + emoji)} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
