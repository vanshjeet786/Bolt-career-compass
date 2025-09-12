import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  backgroundOpacity?: number; // 0-100
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  backgroundOpacity = 10,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-2xl hover:border-white/30 transition-all duration-300' : '';
  
  return (
    <div
      className={`backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      style={{ backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity / 100})` }}
    >
      {children}
    </div>
  );
};