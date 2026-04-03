import React from 'react';
import { motion } from 'framer-motion';

export type LogoVariant = 'default' | 'onDark';

/** Left bubble: pass `color` for explicit fill; else uses theme primary via CSS variable. */
const Logo: React.FC<{
  size?: number;
  showText?: boolean;
  className?: string;
  color?: string;
  /** `onDark`: high-contrast wordmark on rose/colored headers (fixes “Nex” blending in). */
  variant?: LogoVariant;
}> = ({ size = 40, showText = false, className = '', color, variant = 'default' }) => {
  const leftFill = color || 'var(--color-primary)';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="relative flex items-center justify-center p-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <path
            d="M20 30H50C58.3 30 65 36.7 65 45V60C65 68.3 58.3 75 50 75H35L20 85V75C11.7 75 5 68.3 5 60V45C5 36.7 11.7 30 20 30Z"
            fill={leftFill}
          />
          <path
            d="M50 20H80C88.3 20 95 26.7 95 35V50C95 58.3 88.3 65 80 65H75V75L60 65H50C41.7 65 35 58.3 35 50V35C35 26.7 41.7 20 50 20Z"
            fill="var(--color-accent-cyan)"
            fillOpacity="0.92"
          />
          <path d="M54 38L42 52H52L46 65L58 51H48L54 38Z" fill="white" />
        </svg>
      </motion.div>

      {showText && (
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          {variant === 'onDark' ? (
            <>
              <span className="text-white [text-shadow:0_1px_2px_rgba(30,41,59,0.25)]">Nex</span>
              <span className="text-primary-soft">Talk</span>
            </>
          ) : (
            <>
              <span className="text-primary">Nex</span>
              <span className="text-accent-indigo">Talk</span>
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default Logo;
