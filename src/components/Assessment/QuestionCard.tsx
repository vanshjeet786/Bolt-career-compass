import React, { useState } from 'react';
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../../types';
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
  previousAssessments = []
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionExplanation, setSuggestionExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Reset explanation when answer is selected
  React.useEffect(() => {
    if (currentAnswer !== undefined && showExplanation) {
      setShowExplanation(false);
      setExplanation('');
    }
  }, [currentAnswer]);
  const handleGetExplanation = async () => {
    if (showExplanation) {
      // Reset explanation when hiding
      setShowExplanation(false);
      setExplanation('');
      return;
    }
    
    setLoadingExplanation(true);
    try {
      const aiExplanation = await aiService.explainQuestion(question, layerId, categoryId);

      setExplanation(aiExplanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanation('This question helps assess your career-related preferences and abilities. Your honest response contributes to more accurate career recommendations.');
      setShowExplanation(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (showSuggestion) {
      // Reset suggestion when hiding
      setShowSuggestion(false);
      setSuggestions([]);
      setSuggestionExplanation('');
      setSelectedSuggestionIndex(0);
      return;
    }
    
    setLoadingSuggestion(true);
    try {
      const aiResponse = await aiService.suggestAnswer(question, userScores, careers);
      setSuggestions(aiResponse.suggestions);
      setSuggestionExplanation(aiResponse.explanation);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Failed to get suggestion:', error);
      setSuggestions([
        'Reflect on your past experiences and identify what activities or environments made you feel most engaged and successful.',
        'Consider the feedback you\'ve received from others about your natural talents and areas where you excel.',
        'Think about your values and what aspects of work or life are most important to you for long-term satisfaction.'
      ]);
      setSuggestionExplanation('These suggestions help you provide thoughtful responses based on self-reflection.');
      setShowSuggestion(true);
    } finally {
      setLoadingSuggestion(false);
    }
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
              loading={loadingExplanation}
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
          </div>
        </div>

        {showExplanation && explanation && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">AI Explanation</p>
                <p className="text-blue-800">{explanation}</p>
              </div>
            </div>
          </div>
        )}

        {showSuggestion && suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-secondary-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-secondary-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-secondary-900">AI Suggestions ({suggestions.length})</p>
                  {suggestions.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSuggestionIndex(Math.max(0, selectedSuggestionIndex - 1))}
                        disabled={selectedSuggestionIndex === 0}
                        className="p-1 rounded-full hover:bg-secondary-100 disabled:opacity-50"
                      >
                        <ChevronUp className="w-4 h-4 text-secondary-600" />
                      </button>
                      <span className="text-xs text-secondary-700">
                        {selectedSuggestionIndex + 1}/{suggestions.length}
                      </span>
                      <button
                        onClick={() => setSelectedSuggestionIndex(Math.min(suggestions.length - 1, selectedSuggestionIndex + 1))}
                        disabled={selectedSuggestionIndex === suggestions.length - 1}
                        className="p-1 rounded-full hover:bg-secondary-100 disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4 text-secondary-600" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-secondary-800 mb-2">{suggestions[selectedSuggestionIndex]}</p>
                {suggestionExplanation && (
                  <p className="text-xs text-secondary-700 italic">{suggestionExplanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {question.type === 'likert' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-6">
            {LIKERT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onAnswer(question.id, option.value)}
                className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  currentAnswer === option.value
                    ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-800 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={currentAnswer as string || ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
            rows={4}
            placeholder="Share your thoughts here..."
          />
        )}
      </div>
    </Card>
  );
};