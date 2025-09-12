import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-2xl hover:border-white/30 transition-all duration-300' : '';

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};
