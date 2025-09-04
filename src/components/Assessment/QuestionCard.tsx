import React, { useState, useEffect } from 'react';
import { HelpCircle, Lightbulb, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Question, AssessmentResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { aiService } from '@/services/aiService';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: number | string | string[]) => void;
  currentAnswer?: number | string | string[];
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
  const [openEndedInput, setOpenEndedInput] = useState<string>('');

  useEffect(() => {
    setShowExplanation(false);
    setShowDetailedExplanation(false);
    setShowSuggestion(false);
    setExplanation('');
    setDetailedExplanation('');
    setSuggestions([]);
    setSuggestionExplanation('');
    setSelectedSuggestionIndex(0);

    if (question.type === 'open-ended') {
      if (question.id === 'l6-synth-4') {
        const initialCareers = Array.isArray(currentAnswer) ? currentAnswer : ['', '', ''];
        setCareerInputs(initialCareers.slice(0, 3).concat(['', '', '']).slice(0, 3));
      } else {
        setOpenEndedInput(typeof currentAnswer === 'string' ? currentAnswer : '');
      }
    }
  }, [question, currentAnswer]);

  const handleOpenEndedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOpenEndedInput(e.target.value);
    onAnswer(question.id, e.target.value);
  };
  
  const handleCareerInputChange = (index: number, value: string) => {
    const newInputs = [...careerInputs];
    newInputs[index] = value;
    setCareerInputs(newInputs);
    onAnswer(question.id, newInputs);
  };

  const handleGetExplanation = () => {
    const staticExplanation = aiService.getQuestionExplanation(question, layerId, categoryId);
    setExplanation(staticExplanation);
    setShowExplanation(!showExplanation);
    setShowDetailedExplanation(false);
  };

  const handleGetDetailedExplanation = async () => {
    if (showDetailedExplanation) {
      setShowDetailedExplanation(false);
      return;
    }
    setLoadingDetailedExplanation(true);
    try {
      const detailed = await aiService.explainQuestionDetailed(question, layerId, categoryId, allUserResponses);
      setDetailedExplanation(detailed);
      setShowDetailedExplanation(true);
    } catch (error) {
      console.error('Failed to get detailed explanation:', error);
      setDetailedExplanation('Could not load detailed explanation.');
    } finally {
      setLoadingDetailedExplanation(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (suggestions.length > 0) {
      setShowSuggestion(!showSuggestion);
      return;
    }
    setLoadingSuggestion(true);
    try {
      const result = await aiService.suggestAnswer(
        question,
        userScores,
        careers,
        previousAssessments,
        allUserResponses
      );
      setSuggestions(result.suggestions);
      setSuggestionExplanation(result.explanation);
      setShowSuggestion(true);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setSuggestions(['Could not load suggestion.']);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const cycleSuggestion = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (selectedSuggestionIndex + 1) % suggestions.length
      : (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
    setSelectedSuggestionIndex(newIndex);
  };

  return (
    <Card className="animate-fade-in" padding="lg">
      <p className="text-xl text-gray-700 mb-8 text-center">{question.text}</p>
      
      {question.type === 'likert' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {LIKERT_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={currentAnswer === value ? 'primary' : 'outline'}
              onClick={() => onAnswer(question.id, value)}
              className="w-full"
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {question.type === 'open-ended' && question.id === 'l6-synth-4' && (
        <div className="space-y-4">
          {careerInputs.map((input, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Career Interest #${index + 1}`}
              value={input}
              onChange={(e) => handleCareerInputChange(index, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          ))}
        </div>
      )}

      {question.type === 'open-ended' && question.id !== 'l6-synth-4' && (
        <textarea
          value={openEndedInput}
          onChange={handleOpenEndedChange}
          placeholder="Your reflections here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          rows={5}
        />
      )}

      <div className="flex items-center justify-center gap-4 mt-8">
        <Button variant="ghost" icon={HelpCircle} onClick={handleGetExplanation}>
          Why is this asked?
        </Button>
        <Button variant="ghost" icon={Lightbulb} onClick={handleGetDetailedExplanation} loading={loadingDetailedExplanation}>
          Explain Deeper
        </Button>
        {question.type === 'open-ended' && (
          <Button variant="ghost" icon={Sparkles} onClick={handleGetSuggestion} loading={loadingSuggestion}>
            AI Suggestion
          </Button>
        )}
      </div>

      {showExplanation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <p className="text-gray-700">{explanation}</p>
        </div>
      )}

      {showDetailedExplanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
          <p className="text-blue-800 whitespace-pre-wrap">{detailedExplanation}</p>
        </div>
      )}

      {showSuggestion && suggestions.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fade-in">
          <p className="text-purple-800 whitespace-pre-wrap">{suggestions[selectedSuggestionIndex]}</p>
          {suggestions.length > 1 && (
             <div className="flex justify-end gap-2 mt-2">
               <Button size="sm" variant="ghost" onClick={() => cycleSuggestion('prev')}>Prev</Button>
               <Button size="sm" variant="ghost" onClick={() => cycleSuggestion('next')}>Next</Button>
             </div>
          )}
        </div>
      )}
    </Card>
  );
};

