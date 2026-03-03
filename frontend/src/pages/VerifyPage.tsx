import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuthStore } from '../context/useAuthStore';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) navigate('/login');
    }, [email, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        setLoading(true);
        setError('');
        try {
            const response = await authService.verify(email, otp);
            setAuth(response.data.user, response.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl"
            >
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Verify Email
                    </h1>
                    <p className="text-gray-600 mt-2">Enter the verification code sent to {email}</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full text-center text-2xl tracking-[1em] font-mono py-4 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyPage;
