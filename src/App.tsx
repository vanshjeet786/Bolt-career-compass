import React, { useState, useEffect, useRef } from 'react';
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

  // Create a ref to hold the user object to prevent stale closures in subscriptions
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

  const saveAssessment = async (assessment: Assessment, userId: string): Promise<Assessment | null> => {
    try {
      // 1. Save the main assessment record and get the full record back
      const { data: savedAssessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          completed_at: assessment.completedAt.toISOString(),
          scores: assessment.scores,
          recommended_careers: assessment.recommendedCareers,
          ml_prediction: assessment.mlPrediction,
          status: 'completed'
        })
        .select('*')
        .single();

      if (assessmentError) throw assessmentError;
      if (!savedAssessment) throw new Error("Failed to create assessment record.");

      const assessmentId = savedAssessment.id;

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
      // Return the full assessment object, which now includes the database ID
      return {
        ...assessment,
        id: savedAssessment.id,
        completedAt: new Date(savedAssessment.completed_at),
      };

    } catch (error) {
      console.error('Error saving assessment:', error);
      return null;
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
        await loadUserAssessments(user.id);

        const inProgressAssessment = localStorage.getItem(`inProgressAssessment_${user.id}`);
        if (inProgressAssessment) {
          setCurrentState('assessment');
        } else {
          setCurrentState('dashboard');
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // A SIGNED_IN event can fire on token refresh. To prevent redirecting the user
          // from a page they are on, we only set state to dashboard if it's a new user.
          if (session.user.id !== userRef.current?.id) {
            const newUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              createdAt: new Date(session.user.created_at),
              assessments: []
            };
            setUser(newUser);
            await loadUserAssessments(newUser.id);
            setCurrentState('dashboard');
          }
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
    if (user) {
      const savedAssessmentWithId = await saveAssessment(assessment, user.id);

      if (savedAssessmentWithId) {
        // Set the current assessment to the one returned from the DB, which includes the ID
        setCurrentAssessment(savedAssessmentWithId);
        // Reload the full list of assessments to ensure UI consistency
        await loadUserAssessments(user.id);
      } else {
        // Handle the case where the assessment fails to save
        console.error("Could not save assessment. Cannot proceed to results.");
        // Optionally, show an error message to the user here
        return;
      }
    } else {
      // For non-logged-in users, the assessment is not saved and won't have an ID
      setCurrentAssessment(assessment);
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

  const handleResumeAssessment = () => {
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
    <div className="min-h-screen bg-background text-gray-100">
      {currentState !== 'assessment' && (
        <Header
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onProfileClick={() => setShowProfileModal(true)}
          onLogout={handleLogout}
          onDownloadReport={currentState === 'results' ? handleDownloadReport : undefined}
          showDownload={currentState === 'results'}
          onDashboard={user && currentState !== 'dashboard' ? handleBackToDashboard : undefined}
        />
      )}

      <main className={currentState !== 'assessment' ? "pt-20" : ""}>
        {currentState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}

        {currentState === 'dashboard' && user && (
          <DashboardPage
            user={user}
            assessments={userAssessments}
            onStartNewAssessment={handleStartNewAssessment}
            onResumeAssessment={handleResumeAssessment}
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