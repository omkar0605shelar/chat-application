import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text-charcoal/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`
              relative w-full ${sizeClasses[size]}
              bg-white rounded-3xl shadow-2xl overflow-hidden
              border border-primary/5 flex flex-col
            `}
          >
            {(title || showClose) && (
              <div className="px-6 py-4 border-b border-primary/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-charcoal">{title}</h3>
                {showClose && (
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-bg-soft text-text-charcoal/40 hover:text-text-charcoal transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
