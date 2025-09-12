import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AssessmentLayer as AssessmentLayerType, Question, AssessmentResponse } from '../../types';
import { QuestionCard } from './QuestionCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AssessmentLayerProps {
  layer: AssessmentLayerType;
  responses: AssessmentResponse[];
  onAnswer: (response: AssessmentResponse) => void;
  onComplete: () => void;
  onBack: () => void;
  userScores?: Record<string, number>;
  careers?: string[];
  previousAssessments?: any[];
  allUserResponses?: AssessmentResponse[];
  previousAnswers?: Map<string, any>;
  headerFont?: string;
}

export const AssessmentLayerComponent: React.FC<AssessmentLayerProps> = ({
  layer,
  responses,
  onAnswer,
  onComplete,
  onBack,
  userScores,
  careers,
  previousAssessments,
  allUserResponses,
  previousAnswers,
  headerFont,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [layer.id]);
  
  // Flatten all questions from all categories
  const allQuestions: Question[] = [];
  Object.entries(layer.categories).forEach(([categoryId, questions]) => {
    questions.forEach(question => {
      allQuestions.push({ ...question, category: categoryId });
    });
  });

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);
  const previousResponse = previousAnswers?.get(currentQuestion?.id);
  
  const handleAnswer = (questionId: string, answer: number | string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const response: AssessmentResponse = {
      layerId: layer.id,
      categoryId: question.category,
      questionId,
      questionText: question.text,
      response: answer
    };
    
    onAnswer(response);
  };

  const canGoNext = currentResponse !== undefined;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  
  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  if (!currentQuestion) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: headerFont }}>{layer.name}</h1>
          <p className="text-gray-600 text-lg">{layer.description}</p>
          <div className="mt-4 text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {allQuestions.length}
          </div>
        </div>
      </Card>

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        currentAnswer={currentResponse?.response}
        previousResponse={previousResponse}
        layerId={layer.id}
        categoryId={currentQuestion.category}
        userScores={userScores}
        careers={careers}
        previousAssessments={previousAssessments}
        allUserResponses={allUserResponses}
      />

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={handlePrevious}
        >
          {canGoBack ? 'Previous' : 'Back to Progress'}
        </Button>
        
        <div className="text-sm text-gray-500">
          {currentQuestionIndex + 1} / {allQuestions.length}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          icon={!isLastQuestion ? ArrowRight : undefined}
        >
          {isLastQuestion ? 'Complete Layer' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
};
