import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Header } from './components/Layout/Header';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultsPage } from './pages/ResultsPage';
import { User, Assessment } from './types';

type AppState = 'landing' | 'assessment' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);

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
    setCurrentState('assessment');
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
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentAssessment(null);
          setCurrentState('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAssessmentComplete = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setCurrentState('results');
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
      />

      <main>
        {currentState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}

        {currentState === 'assessment' && user && (
          <AssessmentPage
            user={user}
            onComplete={handleAssessmentComplete}
          />
        )}

        {currentState === 'results' && currentAssessment && user && (
          <ResultsPage
            assessment={currentAssessment}
            user={user}
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