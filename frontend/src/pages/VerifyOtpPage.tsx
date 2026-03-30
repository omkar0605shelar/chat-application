import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../features/auth/authSlice';

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(timer === 0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please login again.');
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter complete OTP');

    setLoading(true);
    try {
      // Fixed endpoint from /api/v1/user/verify to /api/v1/verify
      const res = await axios.post('http://localhost:5000/api/v1/verify', { email, otp: otpString });
      toast.success('Verification successful!');
      
      // Update Redux authentication state
      const { token, user } = res.data;
      dispatch(setUser({ user, token }));
      
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/v1/user/login', { email });
      toast.success('OTP resent!');
      setTimer(300);
      setCanResend(false);
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // SVG circular progress
  const progress = (timer / 300) * 100;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-soft font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg px-6"
      >
        <div className="glass rounded-[32px] p-8 md:p-12 shadow-2xl backdrop-blur-xl border border-white/40">
          <div className="flex flex-col items-center mb-8">
            <Logo size={48} showText={false} />
            <h1 className="text-3xl font-bold text-text-charcoal mt-6 tracking-tight">Verify Your Identity</h1>
            <p className="text-primary/60 font-medium mt-2 text-center">
              Enter the 6-digit code sent to <br />
              <span className="text-primary font-bold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-10">
            <div className="flex justify-between gap-2 max-w-sm mx-auto">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-16 md:w-14 md:h-18 bg-white border-2 border-primary/10 rounded-2xl text-center text-2xl font-bold text-primary focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-primary/5"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    className="text-accent-coral"
                    strokeLinecap="round"
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute text-xs font-bold text-accent-coral">
                  {formatTime(timer)}
                </div>
              </div>

              {timer === 0 ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResend}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-soft transition-colors"
                >
                  <RefreshCcw size={16} />
                  Resend OTP
                </motion.button>
              ) : (
                <p className="text-xs text-primary/40 text-center font-medium">
                  Didn't receive the code? You can resend <br />
                  it after the timer runs out.
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary-soft text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-50"
              disabled={loading || otp.some(d => !d)}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Continue'}
            </motion.button>
            
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-primary/40 hover:text-primary transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
