import React, { useState, useEffect } from 'react';
import { Assessment } from '../../types';
import { calculateImprovements, ViewMode, Improvement } from '../../utils/analytics';
import { Card } from '../ui/Card';
import { ViewModeSelector } from './ViewModeSelector';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface AreasImprovedCardProps {
  assessments: Assessment[];
  globalMode: ViewMode;
}

export const AreasImprovedCard: React.FC<AreasImprovedCardProps> = ({ assessments, globalMode }) => {
  const [mode, setMode] = useState<ViewMode>(globalMode);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Update local mode when global mode changes
  useEffect(() => {
    setMode(globalMode);
  }, [globalMode]);

  useEffect(() => {
    const data = calculateImprovements(assessments, mode);
    setImprovements(data);
  }, [assessments, mode]);

  return (
    <Card className="bg-white border-green-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg border border-green-100">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900">Areas Improved</h3>
        </div>
        <ViewModeSelector mode={mode} onChange={setMode} variant="card" />
      </div>

      <div className="flex-1">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{improvements.length}</span>
          <span className="text-sm text-gray-500">areas</span>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {mode === 'latest' && 'Compared to previous assessment'}
          {mode === 'trend' && 'Compared to last 5 assessments avg'}
          {mode === 'overall' && 'Compared to all-time average'}
        </p>

        {improvements.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center mb-2"
            >
              {showDetails ? 'Hide details' : 'View details'}
            </button>

            {showDetails && (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {improvements.map((imp) => (
                  <div key={imp.category} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100 text-sm">
                    <span className="text-gray-700 font-medium truncate flex-1 mr-2">{imp.category}</span>
                    <div className="flex items-center text-green-700 font-bold whitespace-nowrap">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +{imp.change.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
