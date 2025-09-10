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
  inProgressAssessment?: Assessment;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({ user, onComplete, previousAssessments = [], inProgressAssessment }) => {
  const [previousAnswersMap, setPreviousAnswersMap] = useState<Map<string, number | string>>(new Map());

  useEffect(() => {
    if (previousAssessments.length > 0) {
      // Sort assessments by date to find the most recent one
      const sortedAssessments = [...previousAssessments].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
      const lastAssessment = sortedAssessments[0];

      const answerMap = new Map<string, number | string>();
      lastAssessment.responses.forEach(response => {
        answerMap.set(response.questionId, response.response);
      });
      setPreviousAnswersMap(answerMap);
    }
  }, [previousAssessments]);

  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [completedLayers, setCompletedLayers] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const initializeAssessment = async () => {
      if (inProgressAssessment) {
        // Resume existing assessment
        setCurrentAssessmentId(inProgressAssessment.id);
        setResponses(inProgressAssessment.responses || []);
        setCurrentLayerIndex(inProgressAssessment.currentLayerIndex || 0);
        setScores(inProgressAssessment.scores || {});
        // Reconstruct completedLayers from currentLayerIndex
        const completed = ASSESSMENT_LAYERS.slice(0, inProgressAssessment.currentLayerIndex).map(l => l.id);
        setCompletedLayers(completed);
      } else {
        // Create a new in-progress assessment
        const { data, error } = await supabase
          .from('assessments')
          .insert({ user_id: user.id, status: 'in-progress' })
          .select()
          .single();

        if (error) {
          console.error("Failed to create new assessment:", error);
        } else if (data) {
          setCurrentAssessmentId(data.id);
          setResponses([]);
          setCurrentLayerIndex(0);
          setScores({});
          setCompletedLayers([]);
        }
      }
    };

    initializeAssessment();
  }, [inProgressAssessment, user.id]);

  const currentLayer = ASSESSMENT_LAYERS[currentLayerIndex];
  const layerResponses = responses.filter(r => r.layerId === currentLayer?.id);

  // Calculate total questions for progress tracking
  const totalQuestions = ASSESSMENT_LAYERS.reduce((total, layer) => {
    return total + Object.values(layer.categories).reduce((layerTotal, questions) => {
      return layerTotal + questions.length;
    }, 0);
  }, 0);

  const currentQuestionIndex = layerResponses.length;

  const handleAnswer = async (response: AssessmentResponse) => {
    if (!currentAssessmentId) return;

    // Optimistically update local state
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== response.questionId);
      return [...filtered, response];
    });

    // Save to database
    const { error } = await supabase
      .from('assessment_responses')
      .upsert({
        assessment_id: currentAssessmentId,
        question_id: response.questionId,
        layer_number: parseInt(response.layerId.replace('layer', '')),
        category_id: response.categoryId,
        question_text: response.questionText,
        response_value: response.response,
      }, { onConflict: 'assessment_id, question_id' });

    if (error) {
      console.error("Failed to save response:", error);
      // Here you might want to add some user-facing error handling
    }
  };


  const handleLayerComplete = async () => {
    if (!currentAssessmentId) return;

    const updatedCompletedLayers = [...completedLayers, currentLayer.id];
    setCompletedLayers(updatedCompletedLayers);
    
    const newScores = calculateScores(responses);
    setScores(newScores);

    const isLastLayer = currentLayerIndex >= ASSESSMENT_LAYERS.length - 1;

    if (isLastLayer) {
      // Finalize and complete the assessment
      const recommendedCareers = generateCareerRecommendations(newScores);
      const finalAssessmentData = {
        scores: newScores,
        status: 'completed',
        completed_at: new Date().toISOString(),
        recommended_careers: recommendedCareers,
        ml_prediction: recommendedCareers[0] || null,
      };

      const { error } = await supabase
        .from('assessments')
        .update(finalAssessmentData)
        .eq('id', currentAssessmentId);

      if (error) {
        console.error("Failed to complete assessment:", error);
      } else {
        const finalAssessment: Assessment = {
          id: currentAssessmentId,
          userId: user.id,
          completedAt: new Date(),
          responses,
          scores: newScores,
          recommendedCareers,
          mlPrediction: recommendedCareers[0],
          status: 'completed',
          currentLayerIndex: currentLayerIndex + 1,
        };
        onComplete(finalAssessment);
      }
    } else {
      // Save progress for the next layer
      const nextLayerIndex = currentLayerIndex + 1;
      setCurrentLayerIndex(nextLayerIndex);

      const { error } = await supabase
        .from('assessments')
        .update({
          scores: newScores,
          current_layer_index: nextLayerIndex,
        })
        .eq('id', currentAssessmentId);

      if (error) {
        console.error("Failed to update assessment progress:", error);
      }
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
              previousAnswersMap={previousAnswersMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};