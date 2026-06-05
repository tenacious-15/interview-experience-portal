import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-indigo-500 border-r-indigo-500 border-b-cyan-500 border-l-slate-800`}
      />
      {size === 'lg' && (
        <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase animate-pulse">
          Loading Portal Data...
        </span>
      )}
    </div>
  );
};
