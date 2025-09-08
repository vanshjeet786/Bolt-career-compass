import React, { useState, useEffect } from 'react';
import { ASSESSMENT_LAYERS } from '../data/assessmentLayers';
import { AssessmentProgress } from '../components/Assessment/AssessmentProgress';
import { AssessmentLayerComponent } from '../components/Assessment/AssessmentLayer';
import { AssessmentResponse, Assessment, User } from '../types';
import { calculateScores, generateCareerRecommendations } from '../services/assessmentService';

interface AssessmentPageProps {
  user: User;
  onComplete: (assessment: Assessment) => void;
  previousAssessments?: Assessment[];
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ user, onComplete, previousAssessments = [] }) => {
  const getInitialState = () => {
    const savedData = localStorage.getItem(`inProgressAssessment_${user.id}`);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Error parsing in-progress assessment data:", error);
        return null;
      }
    }
    return null;
  };

  const initialState = getInitialState();

  const [currentLayerIndex, setCurrentLayerIndex] = useState(initialState?.currentLayerIndex || 0);
  const [responses, setResponses] = useState<AssessmentResponse[]>(initialState?.responses || []);
  const [completedLayers, setCompletedLayers] = useState<string[]>(initialState?.completedLayers || []);
  const [scores, setScores] = useState<Record<string, number>>(initialState?.scores || {});

  useEffect(() => {
    const inProgressData = {
      currentLayerIndex,
      responses,
      completedLayers,
      scores,
    };
    localStorage.setItem(`inProgressAssessment_${user.id}`, JSON.stringify(inProgressData));
  }, [currentLayerIndex, responses, completedLayers, scores, user.id]);

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

      localStorage.removeItem(`inProgressAssessment_${user.id}`);
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
              previousAssessments={previousAssessments}
              allUserResponses={responses}
            />
          </div>
        </div>
      </div>
    </div>
  );
};