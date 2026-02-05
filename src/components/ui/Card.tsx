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

  // Updated to use light glass effect and rounded-3xl
  const hoverClasses = hover ? 'hover:shadow-xl hover:border-primary-500/30 transition-all duration-300' : '';

  return (
    <div className={`glass rounded-3xl shadow-xl ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};
