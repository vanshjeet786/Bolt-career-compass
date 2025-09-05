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

  const