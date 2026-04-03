import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_EMOJIS = [
  '❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '👏', '🙌', '🎉',
  '🤔', '😍', '✨', '🙏', '💯', '✅', '❌', '👀', '🚀', '🌈'
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose, isOpen, className = '' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="emoji-picker-wrapper">
          <div 
            key="emoji-picker-overlay"
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={onClose} 
          />
          <motion.div
            key="emoji-picker-panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`
              absolute bottom-full mb-4 left-0 z-50
              p-3 glass rounded-3xl shadow-2xl border border-primary/10
              grid grid-cols-5 gap-1.5
              ${className}
            `}
          >
            {COMMON_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-primary/5 rounded-xl transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default EmojiPicker;
