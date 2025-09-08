import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Header } from './components/Layout/Header';
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { User, Assessment } from './types';

type AppState = 'landing' | 'dashboard' | 'assessment' | 'results';

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
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_responses (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formattedAssessments: Assessment[] = assessments.map(assessment => ({
        id: assessment.id,
        userId: assessment.user_id,
        completedAt: new Date(assessment.completed_at),
        responses: assessment.assessment_responses.map((response: any) => ({
          layerId: `layer${response.layer_number}`,
          categoryId: 'unknown', // We'll need to derive this from question_id
          questionId: response.question_id,
          questionText: 'Question text', // We'll need to look this up
          response: response.response_value
        })),
        scores: {}, // We'll calculate this from responses
        recommendedCareers: [], // We'll derive this from scores
        mlPrediction: 'Data Science' // Default prediction
      }));

      setUserAssessments(formattedAssessments);
    } catch (error) {
      console.error('Failed to load user assessments:', error);
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

  const handleAssessmentComplete = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setUserAssessments(prev => [...prev, assessment]);
    setCurrentState('results');
  };

  const handleStartNewAssessment = () => {
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