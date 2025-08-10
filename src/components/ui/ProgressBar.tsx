import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  total, 
  className = '' 
}) => {
  const percentage = Math.min((progress / total) * 100, 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="text-center text-sm text-gray-600 mt-2">
        {progress} of {total} completed ({Math.round(percentage)}%)
      </div>
    </div>
  );
};