import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-primary/5 rounded-2xl ${className}`} />
  );
};

export const ChatListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-3xl mb-2">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-12 h-3" />
        </div>
        <Skeleton className="w-40 h-3" />
      </div>
    </div>
  );
};

export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn }) => {
  return (
    <div className={`flex items-end gap-3 mb-6 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && <Skeleton className="w-8 h-8 rounded-full" />}
      <div className={`space-y-2 max-w-[70%]`}>
        <Skeleton className={`h-10 rounded-2xl ${isOwn ? 'w-48' : 'w-56'}`} />
        <Skeleton className={`h-3 w-12 ${isOwn ? 'ml-auto' : ''}`} />
      </div>
    </div>
  );
};

export default Skeleton;
