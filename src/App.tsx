import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Header } from './components/Layout/Header';
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { User, Assessment, AssessmentResponse } from './types';
import { calculateScores, generateCareerRecommendations } from './services/assessmentService';

type AppState = 'landing' | 'dashboard' | 'assessment' | 'results';

interface SupabaseResponse {
  layer_number: number;
  category_id: string;
  question_id: string;
  question_text: string;
  response_value: number | string | string[];
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [userAssessments, setUserAssessments] = useState<Assessment[]>([]);

  // Load user assessments from Supabase
  const loadUserAssessments = async (userId: string) => {
    try {
      const { data: assessmentsData, error } = await supabase
        .from('assessments')
        .select(`
          id,
          user_id,
          completed_at,
          scores,
          recommended_careers,
          ml_prediction,
          assessment_responses (
            assessment_id,
            question_id,
            question_text,
            question_text,
            response_value,
            category_id,
            category_id,
            layer_number
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formattedAssessments: Assessment[] = assessmentsData.map(assessment => {
        const responses: AssessmentResponse[] = assessment.assessment_responses.map((r: any) => ({
          layerId: `layer${r.layer_number}`,
          categoryId: r.category_id,
          questionId: r.question_id,
          questionText: r.question_text,
          response: r.response_value,
        }));

        // Recalculate scores and recommendations to ensure data integrity,
        // but prefer the stored values if they exist.
        const scores = (assessment.scores && Object.keys(assessment.scores).length > 0)
          ? assessment.scores
          : calculateScores(responses);

        const recommendedCareers = (assessment.recommended_careers && assessment.recommended_careers.length > 0)
          ? assessment.recommended_careers
          : generateCareerRecommendations(scores);

        return {
          id: assessment.id,
          userId: assessment.user_id,
          completedAt: new Date(assessment.completed_at),
          responses,
          scores,
          recommendedCareers,
          mlPrediction: assessment.ml_prediction || recommendedCareers[0],
        };
      });

      setUserAssessments(formattedAssessments);
    } catch (error) {
      console.error('Failed to load user assessments:', error);
    }
  };

  const saveAssessment = async (assessment: Assessment, userId: string) => {
    try {
      // 1. Save the main assessment record
      const { data: assessmentRecord, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          completed_at: assessment.completedAt.toISOString(),
          scores: assessment.scores,
          recommended_careers: assessment.recommendedCareers,
          ml_prediction: assessment.mlPrediction,
          status: 'completed'
        })
        .select('id')
        .single();

      if (assessmentError) throw assessmentError;
      if (!assessmentRecord) throw new Error("Failed to create assessment record.");

      const assessmentId = assessmentRecord.id;

      // 2. Prepare and save all the assessment responses
      const responsesToInsert = assessment.responses.map(response => ({
        assessment_id: assessmentId,
        question_id: response.questionId,
        question_text: response.questionText,
        response_value: response.response,
        category_id: response.categoryId,
        layer_number: parseInt(response.layerId.replace('layer', ''), 10)
      }));

      const { error: responsesError } = await supabase
        .from('assessment_responses')
        .insert(responsesToInsert);

      if (responsesError) throw responsesError;

      console.log('Assessment saved successfully!');
      return { success: true };

    } catch (error) {
      console.error('Error saving assessment:', error);
      return { success: false, error };
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentState('assessment');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuth = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    loadUserAssessments(authenticatedUser.id);
    setCurrentState('dashboard');
  };

  const handleLogout = () => {
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
        setCurrentAssessment(null);
        setCurrentState('landing');
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear local state even if logout fails
        setUser(null);
        setCurrentAssessment(null);
        setCurrentState('landing');
      }
    };
    logout();
  };

  // Check for existing session on app load
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          createdAt: new Date(session.user.created_at),
          assessments: []
        };
        setUser(user);
        loadUserAssessments(user.id);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            createdAt: new Date(session.user.created_at),
            assessments: []
          };
          setUser(user);
          loadUserAssessments(user.id);
          setCurrentState('dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentAssessment(null);
          setUserAssessments([]);
          setCurrentState('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAssessmentComplete = async (assessment: Assessment) => {
    setCurrentAssessment(assessment);

    if (user) {
      const { success } = await saveAssessment(assessment, user.id);
      if (success) {
        // Reload assessments from the database to ensure consistency
        await loadUserAssessments(user.id);
      }
    } else {
      // If there's no user, just update local state for the session
      setUserAssessments(prev => [...prev, assessment]);
    }

    setCurrentState('results');
  };

  const handleStartNewAssessment = () => {
    if (user) {
      localStorage.removeItem(`inProgressAssessment_${user.id}`);
    }
    setCurrentAssessment(null);
    setCurrentState('assessment');
  };

  const handleViewResults = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setCurrentState('results');
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
  };

  const handleDownloadReport = () => {
    if (currentAssessment && user) {
      // This would be handled in the ResultsPage component
      console.log('Download report triggered');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onProfileClick={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        onDownloadReport={currentState === 'results' ? handleDownloadReport : undefined}
        showDownload={currentState === 'results'}
        onDashboard={user && currentState !== 'dashboard' ? handleBackToDashboard : undefined}
      />

      <main>
        {currentState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}

        {currentState === 'dashboard' && user && (
          <DashboardPage
            user={user}
            assessments={userAssessments}
            onStartNewAssessment={handleStartNewAssessment}
            onViewResults={handleViewResults}
          />
        )}

        {currentState === 'assessment' && user && (
          <AssessmentPage
            user={user}
            onComplete={handleAssessmentComplete}
            previousAssessments={userAssessments}
          />
        )}

        {currentState === 'results' && currentAssessment && user && (
          <ResultsPage
            assessment={currentAssessment}
            user={user}
            previousAssessments={userAssessments.slice(0, -1)}
          />
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        assessments={userAssessments}
        onViewResults={handleViewResults}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;