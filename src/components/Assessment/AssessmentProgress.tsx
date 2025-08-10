import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { AssessmentLayer } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

interface AssessmentProgressProps {
  layers: AssessmentLayer[];
  currentLayerIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  completedLayers: string[];
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  layers,
  currentLayerIndex,
  currentQuestionIndex,
  totalQuestions,
  completedLayers
}) => {
  const totalCompleted = completedLayers.length * 100 + currentQuestionIndex;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Progress</h2>
        <ProgressBar progress={totalCompleted} total={totalQuestions * layers.length} />
      </div>
      
      <div className="space-y-3">
        {layers.map((layer, index) => {
          const isCompleted = completedLayers.includes(layer.id);
          const isCurrent = index === currentLayerIndex;
          
          return (
            <div 
              key={layer.id} 
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                isCurrent ? 'bg-blue-50 border-2 border-blue-200' :
                isCompleted ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 mr-3">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className={`w-6 h-6 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  isCurrent ? 'text-blue-800' : 
                  isCompleted ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {layer.name}
                </h3>
                <p className={`text-sm ${
                  isCurrent ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {layer.description}
                </p>
              </div>
              {isCurrent && (
                <div className="text-sm text-blue-600 font-medium">
                  In Progress
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};