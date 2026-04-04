import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Loader2, KeyRound, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../app/hooks';

interface FriendOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendOtpModal: React.FC<FriendOtpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'enter'>('generate');
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputOtp, setInputOtp] = useState(['', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { token } = useAppSelector(state => state.auth);

  // Auto-generate on open
  useEffect(() => {
    if (isOpen && activeTab === 'generate' && !otpCode) {
      handleGenerate();
    }
  }, [isOpen, activeTab]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://chat-app-user-5koa.onrender.com/api/v1/friends/generate-otp',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpCode(res.data.data.otp);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...inputOtp];
    newOtp[index] = value;
    setInputOtp(newOtp);

    // Auto focus next
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputOtp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAddFriend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = inputOtp.join('');
    if (code.length < 5) return toast.error('Please enter the full 5-digit code');

    setLoading(true);
    try {
      await axios.post(
        'https://chat-app-user-5koa.onrender.com/api/v1/friends/add-by-otp',
        { otp: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend added successfully! 🎉');
      onClose();
      setInputOtp(['', '', '', '', '']);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-charcoal/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-primary/5 hover:bg-primary/10 text-primary/60 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-soft text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <KeyRound size={20} />
              </div>
              <h2 className="text-2xl font-bold text-text-charcoal">Connect via Code</h2>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-primary/5 p-1 rounded-2xl mb-8 relative">
              <button 
                onClick={() => setActiveTab('generate')}
                className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${activeTab === 'generate' ? 'text-primary' : 'text-primary/40 hover:text-primary/60'}`}
              >
                My Code
              </button>
              <button 
                onClick={() => setActiveTab('enter')}
                className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${activeTab === 'enter' ? 'text-primary' : 'text-primary/40 hover:text-primary/60'}`}
              >
                Enter Code
              </button>
              
              {/* Sliding Background */}
              <motion.div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-primary/5"
                animate={{ x: activeTab === 'generate' ? 4 : '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {activeTab === 'generate' ? (
                <motion.div 
                  key="generate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center py-4"
                >
                  <p className="text-sm font-medium text-primary/40 mb-6 text-center">
                    Share this code with a friend. <br/> It expires in 10 minutes.
                  </p>
                  
                  <div className="relative group cursor-pointer" onClick={handleCopy}>
                    {loading ? (
                      <div className="w-48 h-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary opacity-50" size={32} />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/15 transition-all p-6 rounded-3xl flex items-center justify-center gap-4 group">
                        <span className="text-5xl font-black tracking-[0.2em] text-primary">{otpCode || '-----'}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-12">
                           {copied ? <Check className="text-positive" /> : <Copy className="text-primary/40" />}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleGenerate}
                    className="mt-8 text-xs font-bold text-primary/40 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw size={14} /> Generate New Code
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="enter"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <p className="text-sm font-medium text-primary/40 mb-6 text-center">
                    Ask your friend to generate a code <br/> and enter it below.
                  </p>
                  
                  <form onSubmit={handleAddFriend} className="flex flex-col items-center">
                    <div className="flex justify-center gap-3 mb-10 w-full">
                      {inputOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-14 h-16 bg-white border-2 border-primary/10 rounded-2xl text-center text-3xl font-black text-primary focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm"
                        />
                      ))}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-14 bg-gradient-to-r from-primary to-primary-soft text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      disabled={loading || inputOtp.join('').length < 5}
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'Connect Now'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendOtpModal;
