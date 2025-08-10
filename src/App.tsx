import React, { useState } from 'react';
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
    setUser(null);
    setCurrentAssessment(null);
    setCurrentState('landing');
  };

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