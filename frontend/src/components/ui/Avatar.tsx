import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OnlineDotProps {
  online?: boolean;
  className?: string;
}

export const OnlineDot: React.FC<OnlineDotProps> = ({ online, className }) => {
  if (!online) return null;
  return (
    <div 
      className={cn(
        "absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full",
        className
      )}
    />
  );
};

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', online, className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div 
      className={cn("relative flex-shrink-0", className)}
      whileHover={{ scale: 1.02 }}
    >
      <div className={cn(
        "rounded-full overflow-hidden bg-primary/10 flex items-center justify-center font-semibold text-primary",
        sizeClasses[size]
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials || '?'}</span>
        )}
      </div>
      {online && <OnlineDot online={online} />}
    </motion.div>
  );
};

export default Avatar;
