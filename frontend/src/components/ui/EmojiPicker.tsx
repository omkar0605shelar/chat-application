import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_CATEGORIES = {
    '😊 Smileys': ['😀','😂','😍','🥰','😎','🤔','😭','😱','🤩','😴','🥳','😡','🤗','🙄','😏','😇','🤭','🥺','😤','🫡','😬','🤪','🫠','😶','😑'],
    '👋 People': ['👋','🤝','👍','👎','❤️','🔥','⭐','💯','🎉','🙏','💪','🤜','✌️','🫶','🤞','👌','🤌','🙌','👏','🫂'],
    '🐶 Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐧','🐦','🐤','🦋','🐝','🐛','🦄','🦖'],
    '🍕 Food': ['🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍰','🎂','🍩','🍪','🍫','☕','🧋','🍵','🥤','🍺','🥂','🍷','🧃'],
    '⚽ Sports': ['⚽','🏀','🎾','🏈','⚾','🏐','🏉','🎱','🏓','🏸','🥊','⛷️','🏊','🤸','🧘','🚴','🏋️','🤼','🤺','🏇'],
    '🌍 Travel': ['✈️','🚀','🚗','🚕','🏠','🏖️','🏝️','🌅','⛰️','🗺️','🗼','🏰','🚢','🚂','🚁','🛸','🌈','⭐','🌙','☀️'],
};

interface EmojiPickerProps {
    isOpen: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'top' | 'bottom';
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
    isOpen,
    onSelect,
    onClose,
    position = 'top',
}) => {
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Click-away overlay */}
                    <div
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 49,
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            [position === 'top' ? 'bottom' : 'top']: 'calc(100% + 8px)',
                            left: 0,
                            background: 'rgba(20, 12, 48, 0.97)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            width: '320px',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                            zIndex: 50,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Category tabs */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '0',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                overflowX: 'auto',
                                padding: '0.25rem',
                            }}
                        >
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '0.4rem 0.6rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background:
                                            activeCategory === cat
                                                ? 'rgba(99,102,241,0.25)'
                                                : 'transparent',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'background 0.15s',
                                    }}
                                    title={cat}
                                >
                                    {cat.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        {/* Emoji grid */}
                        <div style={{ padding: '0.5rem', height: '200px', overflowY: 'auto' }}>
                            <div className="emoji-grid">
                                {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map(
                                    (emoji) => (
                                        <button
                                            key={emoji}
                                            className="emoji-btn"
                                            onClick={() => {
                                                onSelect(emoji);
                                                onClose();
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EmojiPicker;
