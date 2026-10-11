import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CodeJoinModal } from './components/CodeJoinModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { CreateQuizPage } from './pages/CreateQuizPage';
import { MyQuizzesPage } from './pages/MyQuizzesPage';
import { QuizAttemptPage } from './pages/QuizAttemptPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyProgressPage } from './pages/MyProgressPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [editQuizId, setEditQuizId] = useState<string | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);

  // Modals
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { attempts } = useQuiz();

  // Check URL parameters on mount (e.g., ?page=login, ?join=CODE or ?quiz=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const joinCode = params.get('join') || params.get('code');
    const quizParam = params.get('quiz');

    if (pageParam === 'login' || pageParam === 'register') {
      setCurrentTab('login');
    } else if (quizParam) {
      setActiveQuizId(quizParam);
      setCurrentTab('attempt');
    } else if (joinCode) {
      setCodeModalOpen(true);
    }
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setCurrentTab('attempt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditQuiz = (quizId: string) => {
    setEditQuizId(quizId);
    setCurrentTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishAttempt = () => {
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAttempt = (attemptId: string) => {
    setActiveAttemptId(attemptId);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateSuccess = (quizId: string) => {
    setEditQuizId(null);
    setCurrentTab('my-quizzes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If currently taking an active assessment, render fullscreen distraction-free mode
  if (currentTab === 'attempt' && activeQuizId) {
    return (
      <div className="min-h-screen bg-purple-50/40 flex flex-col font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        <QuizAttemptPage
          quizId={activeQuizId}
          onFinish={handleFinishAttempt}
          onCancel={() => {
            setActiveQuizId(null);
            setCurrentTab('explore');
          }}
        />
      </div>
    );
  }

  // Selected attempt for results page
  const selectedAttempt = activeAttemptId 
    ? attempts.find(a => a.id === activeAttemptId) 
    : null;

  return (
    <div className="min-h-screen bg-[#f8f5fe] flex flex-col font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setEditQuizId(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openCodeModal={() => setCodeModalOpen(true)}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="grow">
        {currentTab === 'home' && (
          <HomePage
            setCurrentTab={setCurrentTab}
            onTakeQuiz={handleTakeQuiz}
            openCodeModal={() => setCodeModalOpen(true)}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onSuccess={() => {
              setCurrentTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBrowseGuest={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'explore' && (
          <ExplorePage
            onTakeQuiz={handleTakeQuiz}
            openCodeModal={() => setCodeModalOpen(true)}
          />
        )}

        {currentTab === 'create' && (
          <CreateQuizPage
            editQuizId={editQuizId}
            onSuccess={handleCreateSuccess}
            onCancel={() => {
              setEditQuizId(null);
              setCurrentTab('my-quizzes');
            }}
          />
        )}

        {currentTab === 'my-quizzes' && (
          <MyQuizzesPage
            onCreateQuiz={() => {
              setEditQuizId(null);
              setCurrentTab('create');
            }}
            onEditQuiz={handleEditQuiz}
            onTakeQuiz={handleTakeQuiz}
          />
        )}

        {currentTab === 'results' && (
          <ResultsPage
            attempt={selectedAttempt}
            onRetake={(qid) => handleTakeQuiz(qid)}
            onExplore={() => setCurrentTab('explore')}
            onViewProgress={() => setCurrentTab('progress')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onTakeQuiz={handleTakeQuiz}
            onViewAttempt={handleViewAttempt}
            setCurrentTab={setCurrentTab}
            openCodeModal={() => setCodeModalOpen(true)}
          />
        )}

        {currentTab === 'progress' && (
          <MyProgressPage
            onViewAttempt={handleViewAttempt}
            onTakeQuiz={handleTakeQuiz}
            setCurrentTab={setCurrentTab}
          />
        )}
      </div>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Modals */}
      <CodeJoinModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onSelectQuiz={handleTakeQuiz}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </AuthProvider>
  );
}
