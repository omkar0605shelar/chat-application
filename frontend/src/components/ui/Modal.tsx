import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    width = '480px',
}) => {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 200,
                        padding: '1rem',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(26, 16, 64, 0.95)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: width,
                            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                            overflow: 'hidden',
                        }}
                    >
                        {title && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: '#f1f5f9',
                                    }}
                                >
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="icon-btn"
                                    style={{ width: '2rem', height: '2rem', borderRadius: '8px' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div style={{ padding: '1.5rem' }}>{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
