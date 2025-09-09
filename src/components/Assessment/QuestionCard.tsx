import React, { useState, useEffect } from 'react';
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
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
  previousAnswersMap?: Map<string, number | string>;
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
  allUserResponses = [],
  previousAnswersMap = new Map()
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
  const [showHistory, setShowHistory] = useState(false);
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

  const handleGetExplanation = () => {
    if (showExplanation) {
      setShowExplanation(false);
      setExplanation('');
      return;
    }
    
    // Get predetermined explanation immediately
    const predeterminedExplanation = aiService.getQuestionExplanation(question, layerId, categoryId);
    setExplanation(predeterminedExplanation);
    setShowExplanation(true);
  };

  const handleGetDetailedExplanation = async () => {
    if (showDetailedExplanation) {
      setShowDetailedExplanation(false);
      setDetailedExplanation('');
      return;
    }
    
    setLoadingDetailedExplanation(true);
    try {
      const aiExplanation = await aiService.explainQuestionDetailed(
        question, 
        layerId, 
        categoryId, 
        allUserResponses
      );
      setDetailedExplanation(aiExplanation);
      setShowDetailedExplanation(true);
    } catch (error) {
      console.error('Failed to get detailed explanation:', error);
      setDetailedExplanation(
        aiService.getQuestionExplanation(question, layerId, categoryId) + 
        ' This question helps identify career paths where you can leverage your natural strengths and find long-term satisfaction. Consider how your response reflects your preferences and abilities.'
      );
      setShowDetailedExplanation(true);
    } finally {
      setLoadingDetailedExplanation(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (showSuggestion) {
      setShowSuggestion(false);
      setSuggestions([]);
      setSuggestionExplanation('');
      setSelectedSuggestionIndex(0);
      return;
    }
    
    setLoadingSuggestion(true);
    try {
      const aiResponse = await aiService.suggestAnswer(
        question, 
        userScores, 
        careers, 
        previousAssessments,
        allUserResponses
      );
      setSuggestions(aiResponse.suggestions);
      setSuggestionExplanation(aiResponse.explanation);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Failed to get suggestion:', error);
      const fallbackResponse = aiService['getFallbackSuggestions'](question);
      setSuggestions(fallbackResponse.suggestions);
      setSuggestionExplanation(fallbackResponse.explanation);
      setShowSuggestion(true);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleCareerInputChange = (index: number, value: string) => {
    const newInputs = [...careerInputs];
    newInputs[index] = value;
    setCareerInputs(newInputs);
    onAnswer(question.id, newInputs);
  };

  return (
    <Card className="mb-6" padding="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-4">
            {question.text}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              icon={HelpCircle}
              onClick={handleGetExplanation}
              className="text-blue-600 hover:text-blue-800"
            >
              {showExplanation ? 'Hide' : 'Explain'}
            </Button>
            {question.type === 'open-ended' && (
              <Button
                variant="ghost"
                size="sm"
                icon={Lightbulb}
                onClick={handleGetSuggestion}
                loading={loadingSuggestion}
                className="text-orange-600 hover:text-orange-800"
              >
                {showSuggestion ? 'Hide' : 'Suggest'}
              </Button>
            )}
            {question.type === 'open-ended' && previousAssessments.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Clock}
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  History
                </Button>
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                    <div className="p-3 border-b">
                      <p className="text-sm font-semibold text-gray-700">Answer History</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {previousAssessments.map((assessment, index) => {
                        const pastResponse = assessment.responses.find(r => r.questionId === question.id);
                        if (pastResponse) {
                          return (
                            <div key={assessment.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                              <p className="text-xs font-bold text-gray-500 mb-1">
                                Assessment #{previousAssessments.length - index} ({new Date(assessment.completedAt).toLocaleDateString()})
                              </p>
                              <p className="text-sm text-gray-800 italic">"{pastResponse.response}"</p>
                            </div>
                          );
                        }
                        return null;
                      }).reverse()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showExplanation && explanation && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Question Explanation</p>
                <p className="text-blue-800 mb-3">{explanation}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Sparkles}
                  onClick={handleGetDetailedExplanation}
                  loading={loadingDetailedExplanation}
                  className="text-purple-600 hover:text-purple-800 text-xs"
                >
                  {showDetailedExplanation ? 'Hide Detailed' : 'Explain More'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showDetailedExplanation && detailedExplanation && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-r-lg ml-4">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">AI-Powered Detailed Explanation</p>
                <p className="text-purple-800">{detailedExplanation}</p>
              </div>
            </div>
          </div>
        )}

        {showSuggestion && suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-secondary-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-secondary-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-secondary-900">
                    Personalized AI Suggestions ({suggestions.length})
                  </p>
                  {suggestions.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSuggestionIndex(Math.max(0, selectedSuggestionIndex - 1))}
                        disabled={selectedSuggestionIndex === 0}
                        className="p-1 rounded-full hover:bg-secondary-100 disabled:opacity-50 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4 text-secondary-600" />
                      </button>
                      <span className="text-xs text-secondary-700 font-medium">
                        {selectedSuggestionIndex + 1}/{suggestions.length}
                      </span>
                      <button
                        onClick={() => setSelectedSuggestionIndex(Math.min(suggestions.length - 1, selectedSuggestionIndex + 1))}
                        disabled={selectedSuggestionIndex === suggestions.length - 1}
                        className="p-1 rounded-full hover:bg-secondary-100 disabled:opacity-50 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4 text-secondary-600" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-white p-3 rounded-lg mb-2 border border-secondary-200">
                  <p className="text-secondary-800 leading-relaxed">{suggestions[selectedSuggestionIndex]}</p>
                </div>
                {suggestionExplanation && (
                  <p className="text-xs text-secondary-700 italic">{suggestionExplanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {question.type === 'likert' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-6">
            {LIKERT_OPTIONS.map((option) => {
              const previousAnswer = previousAnswersMap.get(question.id);
              const isPreviousAnswer = previousAnswer === option.value;
              const isCurrentAnswer = currentAnswer === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onAnswer(question.id, option.value)}
                  className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    isCurrentAnswer
                      ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-800 shadow-lg'
                      : isPreviousAnswer
                      ? 'border-gray-200 bg-blue-100' // Highlight for previous answer
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : question.id === 'l6-synth-4' ? (
          <div className="space-y-4 mt-6">
            <p className="text-sm text-gray-600 mb-4">Please list your top 3 career interest areas:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerInputs.map((value, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Career {index + 1}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCareerInputChange(index, e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder={`Enter career area ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <textarea
            value={currentAnswer as string || ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
            rows={4}
            placeholder="Share your thoughts here..."
          />
        )}
      </div>
    </Card>
  );
};