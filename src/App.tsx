import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Header } from './components/Layout/Header';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { User, Assessment } from './types';
import { assessmentService } from './services/assessmentService';

type AppState = 'landing' | 'dashboard' | 'assessment' | 'results' | 'profile';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [userAssessments, setUserAssessments] = useState<Assessment[]>([]);
  const [hasInProgressAssessment, setHasInProgressAssessment] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      setCurrentState('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuth = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    await loadUserAssessments(authenticatedUser.id);
    checkForInProgressAssessment(authenticatedUser.id);
    setCurrentState('dashboard');
  };

  const handleLogout = () => {
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
        setCurrentAssessment(null);
        setUserAssessments([]);
        setHasInProgressAssessment(false);
        setCurrentState('landing');
      } catch (error) {
        console.error('Logout error:', error);
        // Still clear local state even if logout fails
        setUser(null);
        setCurrentAssessment(null);
        setUserAssessments([]);
        setHasInProgressAssessment(false);
        setCurrentState('landing');
      }
    };
    logout();
  };

  const loadUserAssessments = async (userId: string) => {
    setLoadingAssessments(true);
    try {
      const assessments = await assessmentService.getUserAssessments(userId);
      setUserAssessments(assessments);
    } catch (error) {
      console.error('Failed to load user assessments:', error);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const checkForInProgressAssessment = (userId: string) => {
    const savedData = localStorage.getItem(`inProgressAssessment_${userId}`);
    setHasInProgressAssessment(!!savedData);
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
        checkForInProgressAssessment(user.id);
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
          setCurrentState('dashboard');
          await loadUserAssessments(user.id);
          checkForInProgressAssessment(user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentAssessment(null);
          setUserAssessments([]);
          setHasInProgressAssessment(false);
          setCurrentState('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAssessmentComplete = async (assessment: Assessment) => {
    try {
      // Save to database
      const savedAssessment = await assessmentService.saveAssessment(
        user!.id,
        assessment.responses,
        assessment.scores,
        assessment.recommendedCareers
      );
      
      setCurrentAssessment(savedAssessment);
      setUserAssessments(prev => [savedAssessment, ...prev]);
      setHasInProgressAssessment(false);
      setCurrentState('results');
    } catch (error) {
      console.error('Failed to save assessment:', error);
      // Still show results even if save fails
      setCurrentAssessment(assessment);
      setUserAssessments(prev => [assessment, ...prev]);
      setCurrentState('results');
    }
  };

  const handleStartNewAssessment = () => {
    // Clear any existing in-progress assessment
    if (user) {
      localStorage.removeItem(`inProgressAssessment_${user.id}`);
      setHasInProgressAssessment(false);
    }
    setCurrentAssessment(assessment);
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

  const handleProfileClick = () => {
    setCurrentState('profile');
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
        onLogout={handleLogout}
        onDownloadReport={currentState === 'results' ? handleDownloadReport : undefined}
        showDownload={currentState === 'results'}
        onDashboard={user && currentState !== 'dashboard' ? handleBackToDashboard : undefined}
        onProfileClick={user ? handleProfileClick : undefined}
      />

      <main>
        {currentState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}

        {currentState === 'dashboard' && user && (
          <DashboardPage
            user={user}
            assessments={userAssessments}
            hasInProgressAssessment={hasInProgressAssessment}
            onStartNewAssessment={handleStartNewAssessment}
            onResumeAssessment={handleResumeAssessment}
            onViewResults={handleViewResults}
            loadingAssessments={loadingAssessments}
          />
        )}

        {currentState === 'assessment' && user && (
          <AssessmentPage
            user={user}
            onComplete={handleAssessmentComplete}
            previousAssessments={userAssessments}
          />
        )}

        {currentState === 'profile' && user && (
          <ProfilePage
            user={user}
            assessments={userAssessments}
            onViewResults={handleViewResults}
            onStartNewAssessment={handleStartNewAssessment}
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
    </div>
  );
}

export default App;