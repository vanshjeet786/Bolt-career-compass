import React, { useState } from 'react';
import { ASSESSMENT_LAYERS } from '../data/assessmentLayers';
import { CAREER_MAPPING } from '../data/careerMapping';
import { AssessmentProgress } from '../components/Assessment/AssessmentProgress';
import { AssessmentLayerComponent } from '../components/Assessment/AssessmentLayer';
import { AssessmentResponse, Assessment, User } from '../types';

interface AssessmentPageProps {
  user: User;
  onComplete: (assessment: Assessment) => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ user, onComplete }) => {
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [completedLayers, setCompletedLayers] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  const currentLayer = ASSESSMENT_LAYERS[currentLayerIndex];
  const layerResponses = responses.filter(r => r.layerId === currentLayer?.id);

  // Calculate total questions for progress tracking
  const totalQuestions = ASSESSMENT_LAYERS.reduce((total, layer) => {
    return total + Object.values(layer.categories).reduce((layerTotal, questions) => {
      return layerTotal + questions.length;
    }, 0);
  }, 0);

  const currentQuestionIndex = layerResponses.length;

  const handleAnswer = (response: AssessmentResponse) => {
    setResponses(prev => {
      // Remove existing response for this question if any
      const filtered = prev.filter(r => r.questionId !== response.questionId);
      return [...filtered, response];
    });
  };

  const calculateScores = (allResponses: AssessmentResponse[]): Record<string, number> => {
    const scoresByCategory: Record<string, number[]> = {};
    
    allResponses.forEach(response => {
      if (typeof response.response === 'number') {
        if (!scoresByCategory[response.categoryId]) {
          scoresByCategory[response.categoryId] = [];
        }
        scoresByCategory[response.categoryId].push(response.response);
      }
    });

    const averageScores: Record<string, number> = {};
    Object.entries(scoresByCategory).forEach(([category, scores]) => {
      if (scores.length > 0) {
        averageScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });

    return averageScores;
  };

  const generateCareerRecommendations = (scores: Record<string, number>): string[] => {
    const recommendations: string[] = [];
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score >= 4.0 && CAREER_MAPPING[category]) {
        recommendations.push(...CAREER_MAPPING[category]);
      }
    });

    // Remove duplicates and limit to top 10
    return [...new Set(recommendations)].slice(0, 10);
  };

  const handleLayerComplete = () => {
    const updatedCompletedLayers = [...completedLayers, currentLayer.id];
    setCompletedLayers(updatedCompletedLayers);
    
    // Update scores with current responses
    const newScores = calculateScores(responses);
    setScores(newScores);

    if (currentLayerIndex < ASSESSMENT_LAYERS.length - 1) {
      setCurrentLayerIndex(prev => prev + 1);
    } else {
      // Assessment complete
      const finalScores = calculateScores(responses);
      const recommendedCareers = generateCareerRecommendations(finalScores);
      
      const assessment: Assessment = {
        id: Date.now().toString(),
        userId: user.id,
        completedAt: new Date(),
        responses,
        scores: finalScores,
        recommendedCareers,
        mlPrediction: recommendedCareers[0] // Simple prediction for demo
      };

      onComplete(assessment);
    }
  };

  const handleBack = () => {
    if (currentLayerIndex > 0) {
      // Remove current layer from completed and go back
      const updatedCompletedLayers = completedLayers.filter(id => id !== currentLayer.id);
      setCompletedLayers(updatedCompletedLayers);
      setCurrentLayerIndex(prev => prev - 1);
    }
  };

  if (!currentLayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <AssessmentProgress
              layers={ASSESSMENT_LAYERS}
              currentLayerIndex={currentLayerIndex}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              completedLayers={completedLayers}
            />
          </div>

          {/* Assessment Content */}
          <div className="lg:col-span-3">
            <AssessmentLayerComponent
              layer={currentLayer}
              responses={layerResponses}
              onAnswer={handleAnswer}
              onComplete={handleLayerComplete}
              onBack={handleBack}
              userScores={scores}
              careers={generateCareerRecommendations(scores)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};