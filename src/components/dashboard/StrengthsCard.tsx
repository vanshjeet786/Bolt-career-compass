import React, { useState, useEffect } from 'react';
import { Assessment } from '../../types';
import { calculateTopStrengths, ViewMode, Strength } from '../../utils/analytics';
import { Card } from '../ui/Card';
import { ViewModeSelector } from './ViewModeSelector';
import { Award } from 'lucide-react';

interface StrengthsCardProps {
  assessments: Assessment[];
  globalMode: ViewMode;
}

export const StrengthsCard: React.FC<StrengthsCardProps> = ({ assessments, globalMode }) => {
  const [mode, setMode] = useState<ViewMode>(globalMode);
  const [strengths, setStrengths] = useState<Strength[]>([]);

  useEffect(() => {
    setMode(globalMode);
  }, [globalMode]);

  useEffect(() => {
    const data = calculateTopStrengths(assessments, mode);
    setStrengths(data);
  }, [assessments, mode]);

  return (
    <Card className="bg-white border-orange-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
            <Award className="w-5 h-5 text-secondary-500" />
          </div>
          <h3 className="font-bold text-gray-900">Top Strengths</h3>
        </div>
        <ViewModeSelector mode={mode} onChange={setMode} variant="card" />
      </div>

      <div className="flex-1">
         <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-4xl font-bold text-gray-900">{strengths.length}</span>
          <span className="text-sm text-gray-500">top strengths</span>
        </div>

        <div className="space-y-3">
          {strengths.map((strength, index) => (
            <div key={strength.category} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-700 text-sm">{strength.category}</span>
              </div>
              <span className="text-secondary-600 font-bold text-sm">
                {strength.score.toFixed(1)}
              </span>
            </div>
          ))}
          {strengths.length === 0 && (
            <p className="text-sm text-gray-400 italic">No data available yet.</p>
          )}
        </div>
      </div>
    </Card>
  );
};
