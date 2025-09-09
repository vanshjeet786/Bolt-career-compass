import React from 'react';
import { CheckCircle, Zap } from 'lucide-react';
import { AssessmentLayer } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';

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
  const completedQuestions = completedLayers.reduce((total, layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      return total + Object.values(layer.categories).reduce((layerTotal, questions) => layerTotal + questions.length, 0);
    }
    return total;
  }, 0) + currentQuestionIndex;

  return (
    <Card className="sticky top-8" padding="lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment Progress</h2>
      <ProgressBar progress={completedQuestions} total={totalQuestions} className="mb-6" />
      <div className="space-y-4">
        {layers.map((layer, index) => {
          const isCompleted = completedLayers.includes(layer.id);
          const isActive = index === currentLayerIndex;
          
          return (
            <div
              key={layer.id}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-gradient-to-r from-primary-50 to-purple-50' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                  isCompleted ? 'bg-green-500' : isActive ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : isActive ? (
                  <Zap className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <span className="text-white font-bold">{index + 1}</span>
                )}
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    isCompleted ? 'text-green-800' : isActive ? 'text-primary-800' : 'text-gray-600'
                  }`}
                >
                  {layer.name}
                </h3>
                <p className="text-sm text-gray-500">{layer.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
