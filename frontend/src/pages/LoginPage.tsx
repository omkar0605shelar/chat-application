import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, MessageSquare, Shield, Zap } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import toast from 'react-hot-toast';

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="flex items-start gap-4 p-4 rounded-3xl hover:bg-white/5 transition-colors group"
  >
    <div className="p-3 rounded-2xl bg-white/10 text-white group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-white text-lg">{title}</h4>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'NexTalk | Login';
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await api.post('/login', { email });
      toast.success('OTP sent to your email!');
      navigate('/verify', { state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Decorative Panel - Visible on MD+ */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Blobs */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-soft/30 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-accent-coral/20 blur-[120px] rounded-full"
        />

        <div className="relative z-10 w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Logo size={80} showText={true} color="white" />
            <h1 className="text-6xl font-black text-white mt-8 tracking-tighter leading-none">
              Connect <br /> Beyond <br /> Limits.
            </h1>
            <p className="text-white/70 text-xl mt-6 font-medium">
              The next generation of real-time messaging, built for everyone.
            </p>
          </motion.div>

          <div className="space-y-4">
            <FeatureItem 
              icon={MessageSquare} 
              title="Real-time Chat" 
              desc="Instant messaging with delivery status and typing indicators." 
            />
            <FeatureItem 
              icon={Shield} 
              title="Secure & Private" 
              desc="Your data is encrypted and secure with our microservice architecture." 
            />
            <FeatureItem 
              icon={Zap} 
              title="Blazing Fast" 
              desc="Optimized performance for a smooth and responsive experience." 
            />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-bg-soft">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo size={64} showText={false} />
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-text-charcoal tracking-tight">Welcome Back</h2>
            <p className="text-text-charcoal/40 font-medium mt-2">Enter your email to continue to NexTalk</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-charcoal/60 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                  <Mail size={22} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-primary/5 rounded-2xl py-4 pl-12 pr-4 text-text-charcoal placeholder:text-primary/20 focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-16 relative group overflow-hidden rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:bg-primary-soft disabled:opacity-70"
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
                    <Loader2 className="animate-spin" size={24} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    Send OTP Code
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="mt-12 pt-8 border-t border-primary/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-charcoal/40">New here? No problem.</span>
              <button className="text-primary font-bold hover:underline">Learn More</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
