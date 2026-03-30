import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      // Assuming back-end matches the spec: POST /api/v1/login { email }
      await axios.post('http://localhost:5000/api/v1/user/login', { email });
      toast.success('OTP sent to your email!');
      // Navigate to verify page with email in state
      navigate('/verify', { state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-bg-soft font-sans">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent-coral/10 blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="glass rounded-[32px] p-8 md:p-12 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col items-center mb-10">
            <Logo size={64} showText={false} />
            <motion.h1 
              initial={{ opacity: 0, s: 0.95 }}
              animate={{ opacity: 1, s: 1 }}
              className="text-4xl font-bold text-text-charcoal mt-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary-soft"
            >
              NexTalk
            </motion.h1>
            <p className="text-primary-soft font-medium mt-2">Connect. Chat. Vibe.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <motion.div 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none"
                animate={{ opacity: email ? 0 : 1 }}
              >
                <Mail size={20} />
              </motion.div>
              
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full bg-white/50 border-2 border-primary/5 rounded-2xl py-4 pl-12 pr-4 text-text-charcoal placeholder:text-primary/30 focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg"
                placeholder="Enter your email"
              />
              
              {/* Floating Label / Indicator could go here, but using placeholder for simplicity as per common modern UX */}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 relative group overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-soft text-white font-bold text-lg shadow-lg shadow-primary/20"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center"
                  >
                    <Loader2 className="animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    Get Started
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-primary/40">
            By continuing, you agree to our <span className="underline cursor-pointer hover:text-primary">Terms of Service</span>
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-primary/40 text-sm font-medium">✨ Premium Chat Experience</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
