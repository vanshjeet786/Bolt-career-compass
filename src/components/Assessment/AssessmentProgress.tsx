import React from 'react';
import { CheckCircle, Circle, Clock, Star } from 'lucide-react';
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
  const currentLayerQuestionCount = layerQuestionCounts[currentLayerIndex];

  let totalCompleted = 0;
  for (let i = 0; i < currentLayerIndex; i++) {
    totalCompleted += layerQuestionCounts[i];
  }
  totalCompleted += currentQuestionIndex;

  const overallProgress = Math.min((totalCompleted / totalQuestions) * 100, 100);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Assessment Progress</h2>
            <p className="text-gray-300 text-sm">Your journey to career clarity</p>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-white/20 rounded-full h-2.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs font-medium text-gray-200">
              {totalCompleted} of {totalQuestions} questions
            </div>
            <div className="text-sm font-bold text-white">
              {Math.round(overallProgress)}%
            </div>
          </div>
        </div>
      </div>

      {/* Layer Progress */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
          Assessment Layers
        </h3>
        {layers.map((layer, index) => {
          const isCompleted = completedLayers.includes(layer.id);
          const isCurrent = index === currentLayerIndex;
          const isUpcoming = index > currentLayerIndex;
          return (
            <div 
              key={layer.id} 
              className={`relative flex items-start p-3 rounded-lg transition-all duration-300 border-2 ${
                isCurrent ? 'border-blue-400 bg-blue-500/20' :
                isCompleted ? 'border-green-400/50 bg-green-500/10' :
                'border-transparent bg-white/10'
              }`}
            >
              {/* Layer Number Badge */}
              <div className="flex-shrink-0 mr-3 mt-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCurrent ? 'bg-blue-400 text-white' :
                  isCompleted ? 'bg-green-400 text-white' :
                  'bg-white/20 text-gray-200'
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
                <h3 className={`font-bold text-base ${
                    isCurrent ? 'text-white' :
                    isCompleted ? 'text-green-300' : 'text-gray-200'
                  }`}>
                    {layer.name}
                  </h3>

                <p className={`text-sm leading-relaxed break-words ${
                  isCurrent ? 'text-gray-300' :
                  isCompleted ? 'text-gray-400' : 'text-gray-400'
                }`}>
                  {layer.description}
                </p>
                
                {/* Layer Progress Bar for Current Layer */}
                {isCurrent && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blue-600 mb-1">
                      <span>Layer Progress</span>
                      <span>{currentQuestionIndex} / {currentLayerQuestionCount} questions</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((currentQuestionIndex / currentLayerQuestionCount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Connecting Line */}
              {index < layers.length - 1 && (
                <div className={`absolute left-9 top-16 w-0.5 h-6 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Motivational Message */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-bold text-purple-800 mb-2">
            {overallProgress < 25 ? "Great start! You're building your career profile." :
             overallProgress < 50 ? "Excellent progress! Keep discovering your strengths." :
             overallProgress < 75 ? "You're doing amazing! Almost there." :
             overallProgress < 100 ? "Final stretch! Your career insights await." :
             "Congratulations! Your career analysis is complete."}
          </h4>
          <p className="text-sm text-purple-700">
            {overallProgress < 100 ? "Each question brings you closer to discovering your ideal career path." :
              "You've completed your comprehensive career assessment!"
            }
          </p>
        </div>
      </div>
    </div>
  );
};
