import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeProps {
  count?: number;
  className?: string;
  variant?: 'danger' | 'success' | 'primary';
}

const Badge: React.FC<BadgeProps> = ({ count, className = '', variant = 'danger' }) => {
  if (count === undefined || count <= 0) return null;

  const variants = {
    danger: 'bg-red-500 text-white',
    success: 'bg-emerald-500 text-white',
    primary: 'bg-primary text-white',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`
          flex items-center justify-center
          min-w-[18px] h-[18px] px-1.5
          rounded-full text-[10px] font-bold
          shadow-sm border border-white/20
          ${variants[variant]}
          ${className}
        `}
      >
        {count > 99 ? '99+' : count}
      </motion.div>
    </AnimatePresence>
  );
};

export default Badge;
