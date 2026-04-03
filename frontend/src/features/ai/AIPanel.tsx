import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import type { AIMessage } from '../../types';

const AIPanel: React.FC<{ inline?: boolean }> = ({ inline }) => {
  const [isOpen, setIsOpen] = useState(inline || false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your NexTalk AI Assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        messages.concat(userMsg).map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const backendMsg =
        error?.response?.data?.message ||
        (typeof error?.message === 'string' ? error.message : '');
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          backendMsg && String(backendMsg).includes('NVIDIA_API_KEY')
            ? 'AI Assistant is not configured on the server. Add NVIDIA_API_KEY to backend/user .env and restart the user service.'
            : backendMsg || 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-[40px] shadow-2xl border border-primary/10 overflow-hidden flex flex-col mx-auto">
        {/* Header */}
        <div className="p-6 bg-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">NexTalk AI Assistant</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Always Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-soft/30 custom-scrollbar"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-primary/5 text-text-charcoal rounded-tl-none shadow-sm'}
              `}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-primary/5 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-primary/5 bg-white">
          <div className="relative flex items-center gap-2">
            <input 
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 h-12 bg-primary/5 border-0 rounded-2xl px-4 text-sm font-medium text-text-charcoal placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                ${input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary/20'}
              `}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[380px] h-[550px] bg-white rounded-[40px] shadow-2xl border border-primary/10 overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">NexTalk AI</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Always Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-soft/30 custom-scrollbar"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white border border-primary/5 text-text-charcoal rounded-tl-none shadow-sm'}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-primary/5 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-primary/5 bg-white">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 h-12 bg-primary/5 border-0 rounded-2xl px-4 text-sm font-medium text-text-charcoal placeholder:text-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                    ${input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary/20'}
                  `}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all
          ${isOpen ? 'bg-white text-primary' : 'bg-primary text-white'}
        `}
      >
        {isOpen ? <X size={32} /> : <Bot size={32} />}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-accent-coral rounded-full flex items-center justify-center border-2 border-white"
            >
              <Sparkles size={10} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default AIPanel;
