import React from 'react';
import { ViewMode } from '../../utils/analytics';
import { Calendar, TrendingUp, History } from 'lucide-react';

interface ViewModeSelectorProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  variant?: 'global' | 'card';
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ mode, onChange, variant = 'global' }) => {
  const options: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: 'latest', label: 'Latest', icon: Calendar },
    { value: 'trend', label: 'Trend (Last 5)', icon: TrendingUp },
    { value: 'overall', label: 'Overall', icon: History },
  ];

  if (variant === 'card') {
    return (
      <select
        value={mode}
        onChange={(e) => onChange(e.target.value as ViewMode)}
        className="text-xs border-gray-200 rounded-md py-1 pl-2 pr-6 text-gray-600 bg-white focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="latest">Latest</option>
        <option value="trend">Trend (Last 5)</option>
        <option value="overall">Overall</option>
      </select>
    );
  }

  return (
    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${mode === option.value
              ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }
          `}
        >
          <option.icon className={`w-4 h-4 mr-2 ${mode === option.value ? 'text-primary-600' : 'text-gray-400'}`} />
          {option.label}
        </button>
      ))}
    </div>
  );
};
