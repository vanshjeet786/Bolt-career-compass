import React, { useState } from 'react';
import { HelpCircle, Lightbulb } from 'lucide-react';
import { Question } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { aiService } from '../../services/aiService';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: number | string) => void;
  currentAnswer?: number | string;
  userScores?: Record<string, number>;
  careers?: string[];
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
  userScores = {},
  careers = []
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const handleGetExplanation = async () => {
    if (showExplanation) {
      // Reset explanation when hiding
      setShowExplanation(false);
      setExplanation('');
      return;
    }
    
    setLoadingExplanation(true);
    try {
      const aiExplanation = await aiService.explainQuestion(question.text);
      setExplanation(aiExplanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanation('Sorry, I couldn\'t generate an explanation right now. Please try again.');
      setShowExplanation(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (showSuggestion) {
      // Reset suggestion when hiding
      setShowSuggestion(false);
      setSuggestion('');
      return;
    }
    
    setLoadingSuggestion(true);
    try {
      const aiSuggestion = await aiService.suggestAnswer(question.text, userScores, careers);
      setSuggestion(aiSuggestion);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Failed to get suggestion:', error);
      setSuggestion('Sorry, I couldn\'t generate a suggestion right now. Please try again.');
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
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">AI Explanation</p>
                <p className="text-blue-700">{explanation}</p>
              </div>
            </div>
          </div>
        )}

        {showSuggestion && suggestion && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 mb-1">AI Suggestion</p>
                <p className="text-orange-700">{suggestion}</p>
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
                className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                  currentAnswer === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            rows={4}
            placeholder="Share your thoughts here..."
          />
        )}
      </div>
    </Card>
  );
};