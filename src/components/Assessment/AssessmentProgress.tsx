import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { AssessmentLayer } from '../../types';

interface AssessmentProgressProps {
  layers: AssessmentLayer[];
  currentLayerIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  completedLayers: string[];
}

function getLayerQuestionCount(layer: AssessmentLayer): number {
  let count = 0;
  Object.values(layer.categories).forEach(questions => {
    count += questions.length;
  });
  return count;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  layers,
  currentLayerIndex,
  currentQuestionIndex,
  totalQuestions,
  completedLayers
}) => {
  const layerQuestionCounts = layers.map(getLayerQuestionCount);
  const layerCount = layerQuestionCounts[currentLayerIndex];

  let totalCompleted = 0;
  for (let i = 0; i < currentLayerIndex; i++) {
    totalCompleted += layerQuestionCounts[i];
  }
  totalCompleted += currentQuestionIndex;

  const overallProgress = Math.min((totalCompleted / totalQuestions) * 100, 100);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 h-full shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary-500/20">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Progress</h2>
            <p className="text-gray-500 text-xs">Your journey to clarity</p>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,166,0,0.3)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs font-medium text-gray-500">
              {totalCompleted} / {totalQuestions}
            </div>
            <div className="text-sm font-bold text-primary-600">
              {Math.round(overallProgress)}%
            </div>
          </div>
        </div>
      </div>

      {/* Layer Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center">
          Layers
        </h3>
        {layers.map((layer, index) => {
          const isCompleted = completedLayers.includes(layer.id);
          const isCurrent = index === currentLayerIndex;

          return (
            <div 
              key={layer.id} 
              className={`relative flex items-start p-3 rounded-2xl transition-all duration-300 border ${
                isCurrent ? 'border-primary-500/30 bg-primary-50' :
                isCompleted ? 'border-green-500/30 bg-green-50' :
                'border-transparent bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Layer Number Badge */}
              <div className="flex-shrink-0 mr-3 mt-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCurrent ? 'bg-primary-500 text-white shadow-md' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              {/* Layer Content */}
              <div className="flex-1">
                <h3 className={`font-bold text-sm ${
                    isCurrent ? 'text-primary-900' :
                    isCompleted ? 'text-green-800' : 'text-gray-500'
                  }`}>
                    {layer.name}
                  </h3>
                
                {/* Layer Progress Bar for Current Layer */}
                {isCurrent && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((currentQuestionIndex / layerCount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Connecting Line */}
              {index < layers.length - 1 && (
                <div className={`absolute left-[1.65rem] top-[3rem] bottom-[-0.75rem] w-px ${
                  isCompleted ? 'bg-green-500/30' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Motivational Message */}
      <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-4 border border-primary-100">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed italic">
            "{overallProgress < 25 ? "Great start! You're building your career profile." :
             overallProgress < 50 ? "Excellent progress! Keep discovering your strengths." :
             overallProgress < 75 ? "You're doing amazing! Almost there." :
             overallProgress < 100 ? "Final stretch! Your career insights await." :
             "Congratulations! Analysis complete."}"
          </p>
        </div>
      </div>
    </div>
  );
};
