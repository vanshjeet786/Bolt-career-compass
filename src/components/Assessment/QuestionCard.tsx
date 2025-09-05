import React, { useState, useEffect } from 'react';
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Question, AssessmentResponse } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { aiService } from '../../services/aiService';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: number | string) => void;
  currentAnswer?: number | string;
  layerId: string;
  categoryId: string;
  userScores?: Record<string, number>;
  careers?: string[];
  previousAssessments?: any[];
  allUserResponses?: AssessmentResponse[];
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' }
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  currentAnswer,
  layerId,
  categoryId,
  userScores = {},
  careers = [],
  previousAssessments = [],
  allUserResponses = []
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionExplanation, setSuggestionExplanation] = useState('');
  const [loadingDetailedExplanation, setLoadingDetailedExplanation] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [careerInputs, setCareerInputs] = useState<string[]>(['', '', '']);

  // Reset all states when answer is selected or question changes
  useEffect(() => {
    setShowExplanation(false);
    setShowDetailedExplanation(false);
    setShowSuggestion(false);
    setExplanation('');
    setDetailedExplanation('');
    setSuggestions([]);
    setSuggestionExplanation('');
    setSelectedSuggestionIndex(0);

    // Initialize career inputs for the specific question
    if (question.id === 'l6-synth-4' && Array.isArray(currentAnswer)) {
      setCareerInputs(currentAnswer.length >= 3 ? currentAnswer.slice(0, 3) : [...currentAnswer, ...Array(3 - currentAnswer.length).fill('')]);
    } else if (question.id === 'l6-synth-4') {
      setCareerInputs(['', '', '']);
    }
  }, [currentAnswer, question.id]);

  const handleExplanationClick = async () => {
    if (!showExplanation) {
      setShowExplanation(true);
      if (!explanation) {
        try {
          const response = await aiService.generateExplanation(question, layerId, categoryId);
          setExplanation(response);
        } catch (error) {
          setExplanation('This question helps assess your preferences and tendencies in this area.');
        }
      }
    } else {
      setShowExplanation(false);
    }
  };

  const handleDetailedExplanationClick = async () => {
    if (!showDetailedExplanation) {
      setShowDetailedExplanation(true);
      if (!detailedExplanation) {
        setLoadingDetailedExplanation(true);
        try {
          const response = await aiService.generateDetailedExplanation(
            question,
            layerId,
            categoryId,
            userScores,
            careers,
            previousAssessments
          );
          setDetailedExplanation(response);
        } catch (error) {
          setDetailedExplanation('This question provides deeper insights into your career preferences and helps refine your assessment results.');
        } finally {
          setLoadingDetailedExplanation(false);
        }
      }
    } else {
      setShowDetailedExplanation(false);
    }
  };

  const handleSuggestionClick = async () => {
    if (!showSuggestion) {
      setShowSuggestion(true);
      if (suggestions.length === 0) {
        setLoadingSuggestion(true);
        try {
          const response = await aiService.generateSuggestions(
            question,
            layerId,
            categoryId,
            userScores,
            careers,
            previousAssessments,
            allUserResponses
          );
          setSuggestions(response.suggestions);
          setSuggestionExplanation(response.explanation);
        } catch (error) {
          // Fallback suggestions based on question type and layer
          const fallbackSuggestions = getFallbackSuggestions(question, layerId);
          setSuggestions(fallbackSuggestions);
          setSuggestionExplanation('Here are some suggestions to help you think about this question.');
        } finally {
          setLoadingSuggestion(false);
        }
      }
    } else {
      setShowSuggestion(false);
    }
  };

  const getFallbackSuggestions = (question: Question, layerId: string): string[] => {
    if (layerId === 'layer6') {
      switch (question.id) {
        case 'l6-synth-1':
          return [
            'Consider your strongest skills from the assessment and think about how you want to develop them further',
            'Think about skills you wish you had that could complement your existing strengths',
            'Reflect on skills that would help you achieve your career goals'
          ];
        case 'l6-synth-2':
          return [
            'Consider what aspects of work environments make you feel most productive and engaged',
            'Think about the balance between collaboration and independent work that suits you best',
            'Reflect on the company culture and values that align with your personal values'
          ];
        case 'l6-synth-3':
          return [
            'Think about what might hold you back from pursuing certain career paths',
            'Consider practical concerns like work-life balance, job security, or required education',
            'Reflect on any limiting beliefs you might have about your capabilities'
          ];
        case 'l6-synth-4':
          return [
            'Based on your assessment results, consider careers that align with your top strengths',
            'Think about industries or roles that match your preferred work environment',
            'Consider careers that address your interests while minimizing your concerns'
          ];
        case 'l6-synth-5':
          return [
            'Consider both short-term goals (1-2 years) and long-term aspirations (5-10 years)',
            'Think about specific milestones or achievements you want to reach',
            'Reflect on how your career goals align with your personal life goals'
          ];
        default:
          return ['Take time to reflect on your experiences and preferences', 'Consider how this relates to your career goals', 'Think about what would make you feel fulfilled'];
      }
    }
    return ['Consider your personal experience with this topic', 'Think about what feels most authentic to you', 'Reflect on your long-term goals'];
  };

  const handleCareerInputChange = (index: number, value: string) => {
    const newInputs = [...careerInputs];
    newInputs[index] = value;
    setCareerInputs(newInputs);
    onAnswer(question.id, newInputs.filter(input => input.trim() !== ''));
  };

  const renderAnswerInput = () => {
    if (question.type === 'likert') {
      return (
        <div className="space-y-2">
          {LIKERT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                currentAnswer === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={currentAnswer === option.value}
                onChange={() => onAnswer(question.id, option.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                currentAnswer === option.value
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {currentAnswer === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.id === 'l6-synth-4') {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-3">
            List your top 3 career areas of interest based on your assessment results:
          </p>
          {careerInputs.map((input, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Career {index + 1}
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => handleCareerInputChange(index, e.target.value)}
                placeholder={`Enter career area ${index + 1}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <textarea
        value={currentAnswer as string || ''}
        onChange={(e) => onAnswer(question.id, e.target.value)}
        placeholder="Share your thoughts..."
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
      />
    );
  };

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {question.text}
        </h3>
        {question.description && (
          <p className="text-gray-600 text-sm">{question.description}</p>
        )}
      </div>

      {renderAnswerInput()}

      {/* Help buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          icon={HelpCircle}
          onClick={handleExplanationClick}
        >
          {showExplanation ? 'Hide' : 'Why this question?'}
        </Button>

        {layerId === 'layer6' && (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Lightbulb}
              onClick={handleDetailedExplanationClick}
            >
              {showDetailedExplanation ? 'Hide' : 'Detailed Context'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleSuggestionClick}
            >
              {showSuggestion ? 'Hide' : 'AI Suggestions'}
            </Button>
          </>
        )}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">{explanation}</p>
        </div>
      )}

      {/* Detailed Explanation */}
      {showDetailedExplanation && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          {loadingDetailedExplanation ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-green-700">Generating detailed context...</span>
            </div>
          ) : (
            <p className="text-green-800">{detailedExplanation}</p>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {showSuggestion && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          {loadingSuggestion ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-purple-700">Generating personalized suggestions...</span>
            </div>
          ) : (
            <div>
              <p className="text-purple-800 mb-3">{suggestionExplanation}</p>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-1 mb-2">
                    {suggestions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSuggestionIndex(index)}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedSuggestionIndex === index
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <p className="text-purple-900 text-sm">
                      {suggestions[selectedSuggestionIndex]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};