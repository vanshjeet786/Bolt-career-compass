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

  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105 transition-all duration-300' : '';
  
  return (
    <div className={`bg-white rounded-xl shadow-lg ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};