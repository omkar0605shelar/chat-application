import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../app/hooks';
import { setUser } from '../features/auth/authSlice';

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds for resend
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const email = location.state?.email || '';

  useEffect(() => {
    document.title = 'NexTalk | Verify';
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

    // Auto verify if last digit entered
    if (value && index === 5) {
      const otpString = newOtp.join('');
      if (otpString.length === 6) {
        handleVerifyInternal(otpString);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyInternal = async (otpString: string) => {
    setLoading(true);
    try {
      const res = await api.post('/verify', { email, otp: otpString });
      toast.success('Verification successful!');
      const { token, user } = res.data;
      dispatch(setUser({ user, token }));
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return toast.error('Please enter complete OTP');
    handleVerifyInternal(otpString);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await api.post('/login', { email });
      toast.success('OTP resent!');
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-soft font-sans relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-indigo/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="glass rounded-[40px] p-10 md:p-12 shadow-2xl backdrop-blur-2xl border border-white/60">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-text-charcoal tracking-tight text-center">Verify Identity</h1>
            <p className="text-text-charcoal/40 font-medium mt-3 text-center leading-relaxed">
              We've sent a 6-digit code to <br />
              <span className="text-primary font-bold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-10">
            <div className="flex justify-between gap-2">
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
                  autoFocus={index === 0}
                  className="w-11 h-14 md:w-14 md:h-18 bg-white border-2 border-primary/5 rounded-2xl text-center text-2xl font-black text-primary focus:border-primary/20 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="space-y-6">
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
                    <motion.span key="text">Verify & Continue</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`
                    flex items-center gap-2 text-sm font-bold transition-all
                    ${canResend ? 'text-primary hover:text-primary-soft' : 'text-text-charcoal/30 cursor-not-allowed'}
                  `}
                >
                  <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-text-charcoal/30 font-medium">
          Didn't receive the code? Check your spam folder.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
