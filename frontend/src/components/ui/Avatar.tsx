import React from 'react';

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    online?: boolean;
    imageUrl?: string;
    gradient?: string;
}

const sizes = {
    sm: { box: '32px', font: '13px', dot: '9px', dotBorder: '1.5px' },
    md: { box: '40px', font: '16px', dot: '11px', dotBorder: '2px' },
    lg: { box: '48px', font: '18px', dot: '13px', dotBorder: '2px' },
    xl: { box: '56px', font: '22px', dot: '14px', dotBorder: '2.5px' },
};

const gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #6366f1)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #f97316, #f59e0b)',
];

const getGradient = (name: string) => {
    const code = name.charCodeAt(0) % gradients.length;
    return gradients[code];
};

const Avatar: React.FC<AvatarProps> = ({
    name,
    size = 'md',
    online,
    imageUrl,
    gradient,
}) => {
    const s = sizes[size];
    const bg = gradient || getGradient(name);
    const initial = name ? name[0].toUpperCase() : '?';

    return (
        <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
                style={{
                    width: s.box,
                    height: s.box,
                    borderRadius: '50%',
                    background: imageUrl ? 'transparent' : bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: s.font,
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    initial
                )}
            </div>
            {online !== undefined && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '1px',
                        right: '1px',
                        width: s.dot,
                        height: s.dot,
                        borderRadius: '50%',
                        background: online ? '#10b981' : '#475569',
                        border: `${s.dotBorder} solid #0f0f23`,
                    }}
                />
            )}
        </div>
    );
};

export default Avatar;
