import React from 'react';

interface DottedSpinnerProps {
  variant?: 'bouncing' | 'default';
  className?: string;
}

export function DottedSpinner({ variant = 'bouncing', className = '' }: DottedSpinnerProps) {
  if (variant === 'bouncing') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="h-3 w-3 bg-[#DC2626] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 bg-[#DC2626] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 bg-[#DC2626] rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse"></div>
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse delay-75"></div>
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse delay-150"></div>
    </div>
  );
}
