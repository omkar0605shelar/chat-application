import React from 'react';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '16px',
    borderRadius = '8px',
    style,
}) => (
    <div
        className="skeleton"
        style={{ width, height, borderRadius, ...style }}
    />
);

export const ChatItemSkeleton: React.FC = () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
        }}
    >
        <Skeleton width="46px" height="46px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="80%" height="12px" />
        </div>
    </div>
);

export const MessageSkeleton: React.FC<{ isMe?: boolean }> = ({ isMe }) => (
    <div
        style={{
            display: 'flex',
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            padding: '0.25rem 1rem',
        }}
    >
        <Skeleton
            width={isMe ? '40%' : '55%'}
            height="40px"
            borderRadius={isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px'}
        />
    </div>
);
