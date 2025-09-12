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

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  layers,
  currentLayerIndex,
  currentQuestionIndex,
  totalQuestions,
  completedLayers
}) => {
  // Calculate progress more accurately
  const questionsPerLayer = Math.floor(totalQuestions / layers.length);
  const totalCompleted = completedLayers.length * questionsPerLayer + currentQuestionIndex;
  const overallProgress = Math.min((totalCompleted / totalQuestions) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assessment Progress</h2>
            <p className="text-gray-600 text-sm">Your journey to career clarity</p>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${overallProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm font-medium text-gray-700">
              {totalCompleted} of {totalQuestions} questions
            </div>
            <div className="text-sm font-bold text-blue-600">
              {Math.round(overallProgress)}% Complete
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="mt-4 flex items-center justify-center bg-blue-50 rounded-lg p-3 border border-blue-200">
          <Clock className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800 font-medium">
            Estimated time remaining: {Math.max(1, Math.ceil((totalQuestions - totalCompleted) * 0.5))} minutes
          </span>
        </div>
      </div>
      
      {/* Layer Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Assessment Layers
        </h3>
        {layers.map((layer, index) => {
          const isCompleted = completedLayers.includes(layer.id);
          const isCurrent = index === currentLayerIndex;
          const isUpcoming = index > currentLayerIndex;

          return (
            <div 
              key={layer.id} 
              className={`relative flex items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                isCurrent ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg' :
                isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-md' :
                'bg-gray-50 border border-gray-200 opacity-75'
              }`}
            >
              {/* Layer Number Badge */}
              <div className="flex-shrink-0 mr-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCurrent ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' :
                  isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              
              {/* Layer Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold text-lg ${
                    isCurrent ? 'text-blue-800' :
                    isCompleted ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {layer.name}
                  </h3>
                  {isCurrent && (
                    <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs font-medium text-blue-800">In Progress</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-xs font-medium text-green-800">Complete</span>
                    </div>
                  )}
                  {isUpcoming && (
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-gray-500 mr-1" />
                      <span className="text-xs font-medium text-gray-600">Upcoming</span>
                    </div>
                  )}
                </div>
                
                <p className={`text-sm leading-relaxed ${
                  isCurrent ? 'text-blue-700' :
                  isCompleted ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {layer.description}
                </p>

                {/* Layer Progress Bar for Current Layer */}
                {isCurrent && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blue-600 mb-1">
                      <span>Layer Progress</span>
                      <span>{currentQuestionIndex} / {questionsPerLayer} questions</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((currentQuestionIndex / questionsPerLayer) * 100, 100)}%` }}
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
