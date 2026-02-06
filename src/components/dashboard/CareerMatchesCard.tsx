import React, { useState, useEffect } from 'react';
import { Assessment } from '../../types';
import { calculateCareerMatches, ViewMode, CareerMatch } from '../../utils/analytics';
import { Card } from '../ui/Card';
import { ViewModeSelector } from './ViewModeSelector';
import { Target, ArrowRight } from 'lucide-react';

interface CareerMatchesCardProps {
  assessments: Assessment[];
  globalMode: ViewMode;
}

export const CareerMatchesCard: React.FC<CareerMatchesCardProps> = ({ assessments, globalMode }) => {
  const [mode, setMode] = useState<ViewMode>(globalMode);
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setMode(globalMode);
  }, [globalMode]);

  useEffect(() => {
    const data = calculateCareerMatches(assessments, mode);
    setMatches(data);
  }, [assessments, mode]);

  // For display, we just show top 3 or 5, unless expanded
  const displayMatches = showAll ? matches : matches.slice(0, 3);

  return (
    <Card className="bg-white border-pink-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-50 rounded-lg border border-pink-100">
            <Target className="w-5 h-5 text-pink-500" />
          </div>
          <h3 className="font-bold text-gray-900">Career Matches</h3>
        </div>
        <ViewModeSelector mode={mode} onChange={setMode} variant="card" />
      </div>

      <div className="flex-1">
         <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-4xl font-bold text-gray-900">{matches.length}</span>
          <span className="text-sm text-gray-500">matches found</span>
        </div>

        <div className="space-y-3">
          {displayMatches.map((match, index) => (
            <div key={match.career} className="group flex items-center justify-between p-2 hover:bg-pink-50 rounded-lg transition-colors border border-transparent hover:border-pink-100">
              <div className="flex items-center flex-1 mr-2">
                 {/* For trend/overall, show rank/frequency indicator */}
                 {mode !== 'latest' && (
                    <div className="w-5 h-5 flex-shrink-0 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center mr-2 text-[10px] font-bold">
                       {match.frequency}x
                    </div>
                 )}
                <span className="text-gray-700 text-sm font-medium truncate">{match.career}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          ))}
          {matches.length === 0 && (
            <p className="text-sm text-gray-400 italic">No matches found yet.</p>
          )}
        </div>

        {matches.length > 3 && (
            <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 text-xs font-medium text-center text-gray-500 hover:text-pink-600 transition-colors py-2 border-t border-gray-100"
            >
                {showAll ? 'Show less' : `Show ${matches.length - 3} more`}
            </button>
        )}
      </div>
    </Card>
  );
};
