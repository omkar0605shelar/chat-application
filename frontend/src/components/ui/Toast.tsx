import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
};

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} color="#10b981" />,
    error: <XCircle size={18} color="#ef4444" />,
    warning: <AlertCircle size={18} color="#f59e0b" />,
    info: <Info size={18} color="#6366f1" />,
};

const colors: Record<ToastType, string> = {
    success: 'rgba(16,185,129,0.15)',
    error: 'rgba(239,68,68,0.15)',
    warning: 'rgba(245,158,11,0.15)',
    info: 'rgba(99,102,241,0.15)',
};

const borders: Record<ToastType, string> = {
    success: 'rgba(16,185,129,0.3)',
    error: 'rgba(239,68,68,0.3)',
    warning: 'rgba(245,158,11,0.3)',
    info: 'rgba(99,102,241,0.3)',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const remove = (id: string) =>
        setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    pointerEvents: 'none',
                }}
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 60, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            style={{
                                background: colors[toast.type],
                                border: `1px solid ${borders[toast.type]}`,
                                borderRadius: '12px',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                pointerEvents: 'auto',
                                minWidth: '280px',
                                maxWidth: '380px',
                            }}
                        >
                            {icons[toast.type]}
                            <span
                                style={{
                                    flex: 1,
                                    fontSize: '0.85rem',
                                    color: '#f1f5f9',
                                    fontWeight: 500,
                                }}
                            >
                                {toast.message}
                            </span>
                            <button
                                onClick={() => remove(toast.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    padding: '2px',
                                }}
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
