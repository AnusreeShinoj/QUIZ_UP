import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Quiz, QuizAttempt, RecommendedQuizItem } from '../types/quiz';
import { INITIAL_SEED_QUIZZES } from '../data/seedQuizzes';
import { useAuth } from './AuthContext';
import { evaluateQuizSubmission, getTopicRecommendations } from '../utils/evaluation';

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  activeAttempt: QuizAttempt | null;
  isLoading: boolean;
  setActiveAttempt: (att: QuizAttempt | null) => void;
  getQuizById: (id: string, mode?: 'take' | 'edit') => Promise<Quiz | null>;
  getQuizByCode: (code: string) => Promise<Quiz | null>;
  createQuiz: (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz>;
  updateQuiz: (id: string, quizData: Partial<Quiz>) => Promise<Quiz>;
  deleteQuiz: (id: string) => Promise<void>;
  togglePublishQuiz: (id: string) => Promise<void>;
  submitQuizAttempt: (
    quizId: string, 
    answers: Record<string, number | null>, 
    timeTakenSeconds: number
  ) => Promise<{ evaluation: QuizAttempt; recommendations: RecommendedQuizItem[] }>;
  getWeakTopicsForUser: (userId?: string) => string[];
  getRecommendationsForUser: (userId?: string) => RecommendedQuizItem[];
  refreshData: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const LOCAL_STORAGE_QUIZZES_KEY = 'quizup_custom_quizzes';
const LOCAL_STORAGE_ATTEMPTS_KEY = 'quizup_user_attempts';

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and load quizzes & attempts
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Try fetching quizzes from backend server
      let loadedQuizzes: Quiz[] = [];
      try {
        const res = await fetch('/api/quizzes');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            loadedQuizzes = data;
          }
        }
      } catch (e) {
        console.warn('Backend API quiz fetch skipped, using local store:', e);
      }

      // Merge with custom quizzes stored in localStorage
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_QUIZZES_KEY);
      const customList: Quiz[] = savedCustom ? JSON.parse(savedCustom) : [];

      // Always combine with INITIAL_SEED_QUIZZES
      const combinedMap = new Map<string, Quiz>();
      INITIAL_SEED_QUIZZES.forEach(q => combinedMap.set(q.id, q));
      customList.forEach(q => combinedMap.set(q.id, q));
      loadedQuizzes.forEach(q => {
        // If already in map with full questions (e.g. from seed), keep full questions
        if (!combinedMap.has(q.id)) {
          combinedMap.set(q.id, q);
        }
      });

      const mergedQuizzes = Array.from(combinedMap.values());
      setQuizzes(mergedQuizzes);

      // 2. Load attempts from Firestore (if signed in) or localStorage
      let userAttempts: QuizAttempt[] = [];
      const localAttemptsStr = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
      if (localAttemptsStr) {
        try {
          userAttempts = JSON.parse(localAttemptsStr);
        } catch {
          userAttempts = [];
        }
      }

      if (user?.uid) {
        try {
          const attemptsRef = collection(db, 'attempts');
          const q = query(attemptsRef, where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const firestoreAttempts: QuizAttempt[] = [];
          snapshot.forEach(docSnap => {
            firestoreAttempts.push(docSnap.data() as QuizAttempt);
          });
          if (firestoreAttempts.length > 0) {
            // merge unique by id
            const attMap = new Map<string, QuizAttempt>();
            firestoreAttempts.forEach(a => attMap.set(a.id, a));
            userAttempts.forEach(a => attMap.set(a.id, a));
            userAttempts = Array.from(attMap.values());
          }
        } catch (err) {
          console.warn('Firestore attempts load error (continuing with cached attempts):', err);
        }
      }

      // Sort attempts descending by date
      userAttempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setAttempts(userAttempts);

    } catch (err) {
      console.error('Error loading quiz data:', err);
      setQuizzes(INITIAL_SEED_QUIZZES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user?.uid]);

  // Fetch a quiz by ID
  const getQuizById = async (id: string, mode: 'take' | 'edit' = 'take'): Promise<Quiz | null> => {
    // Check in-memory store first
    const found = quizzes.find(q => q.id === id);
    if (found) {
      return found;
    }

    try {
      const res = await fetch(`/api/quizzes/${id}?mode=${mode}&requesterId=${userProfile?.id || ''}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Fetch quiz by ID fallback:', e);
    }

    return null;
  };

  // Find quiz by unique 6-digit share code
  const getQuizByCode = async (code: string): Promise<Quiz | null> => {
    const cleanCode = code.trim().toUpperCase();
    const found = quizzes.find(q => q.shareCode?.toUpperCase() === cleanCode);
    if (found) return found;

    try {
      const res = await fetch(`/api/quizzes/code/${cleanCode}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Fetch quiz by code API error:', e);
    }
    return null;
  };

  // Create new quiz
  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    const newId = 'quiz-' + Date.now();
    const now = new Date().toISOString();
    
    // Auto generate clean shareCode if none provided
    const prefix = (quizData.subject || 'IT').substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'Q');
    const shareCode = quizData.shareCode?.trim().toUpperCase() || `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuiz: Quiz = {
      ...quizData,
      id: newId,
      shareCode,
      createdAt: now,
      updatedAt: now,
      totalQuestions: quizData.questions.length,
      totalPoints: quizData.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      attemptCount: 0
    };

    // 1. Send to server
    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz)
      });
    } catch (e) {
      console.warn('Server create quiz warning:', e);
    }

    // 2. Persist in Firestore if authenticated
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'quizzes', newId), newQuiz);
      } catch (err) {
        console.warn('Firestore quiz persist fallback:', err);
      }
    }

    // 3. Update local state & localStorage
    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    
    const savedCustom = localStorage.getItem(LOCAL_STORAGE_QUIZZES_KEY);
    const customList: Quiz[] = savedCustom ? JSON.parse(savedCustom) : [];
    customList.unshift(newQuiz);
    localStorage.setItem(LOCAL_STORAGE_QUIZZES_KEY, JSON.stringify(customList));

    return newQuiz;
  };

  // Update existing quiz
  const updateQuiz = async (id: string, updatedData: Partial<Quiz>): Promise<Quiz> => {
    const index = quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quiz not found');
    }

    const existing = quizzes[index];
    const questions = updatedData.questions || existing.questions;
    const updatedQuiz: Quiz = {
      ...existing,
      ...updatedData,
      id,
      updatedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      totalPoints: questions.reduce((s, q) => s + (q.points || 1), 0)
    };

    // Server update
    try {
      await fetch(`/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuiz)
      });
    } catch (e) {
      console.warn('Server update quiz error:', e);
    }

    // Firestore update if creator
    if (user?.uid && existing.creatorId === user.uid) {
      try {
        await setDoc(doc(db, 'quizzes', id), updatedQuiz, { merge: true });
      } catch (err) {
        console.warn('Firestore update quiz error:', err);
      }
    }

    // Update state
    const nextQuizzes = [...quizzes];
    nextQuizzes[index] = updatedQuiz;
    setQuizzes(nextQuizzes);

    const savedCustom = localStorage.getItem(LOCAL_STORAGE_QUIZZES_KEY);
    const customList: Quiz[] = savedCustom ? JSON.parse(savedCustom) : [];
    const customIdx = customList.findIndex(q => q.id === id);
    if (customIdx >= 0) {
      customList[customIdx] = updatedQuiz;
    } else {
      customList.push(updatedQuiz);
    }
    localStorage.setItem(LOCAL_STORAGE_QUIZZES_KEY, JSON.stringify(customList));

    return updatedQuiz;
  };

  // Delete quiz
  const deleteQuiz = async (id: string): Promise<void> => {
    try {
      await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Server delete quiz error:', e);
    }

    setQuizzes(prev => prev.filter(q => q.id !== id));

    const savedCustom = localStorage.getItem(LOCAL_STORAGE_QUIZZES_KEY);
    if (savedCustom) {
      const customList: Quiz[] = JSON.parse(savedCustom);
      const filtered = customList.filter(q => q.id !== id);
      localStorage.setItem(LOCAL_STORAGE_QUIZZES_KEY, JSON.stringify(filtered));
    }
  };

  // Toggle Publish / Unpublish
  const togglePublishQuiz = async (id: string): Promise<void> => {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;
    await updateQuiz(id, { isPublished: !quiz.isPublished });
  };

  // Submit quiz attempt (Evaluated on server, saved in database)
  const submitQuizAttempt = async (
    quizId: string,
    answers: Record<string, number | null>,
    timeTakenSeconds: number
  ): Promise<{ evaluation: QuizAttempt; recommendations: RecommendedQuizItem[] }> => {
    const quiz = quizzes.find(q => q.id === quizId) || INITIAL_SEED_QUIZZES.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error('Quiz not found for submission');
    }

    let evaluationResult: QuizAttempt;
    let recsResult: RecommendedQuizItem[];

    try {
      // 1. Submit to server API for server-side evaluation
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeTakenSeconds,
          userId: userProfile?.id || user?.uid || 'guest-student',
          userName: userProfile?.displayName || 'Student',
          userEmail: userProfile?.email || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        evaluationResult = data.evaluation;
        recsResult = data.recommendations;
      } else {
        throw new Error('Server submission responded with error');
      }
    } catch (e) {
      console.warn('Server evaluation API fallback to client rule evaluation:', e);
      // Fallback: evaluate using the same deterministic JavaScript rules
      evaluationResult = evaluateQuizSubmission(
        quiz,
        answers,
        timeTakenSeconds,
        {
          uid: userProfile?.id || user?.uid || 'guest-student',
          displayName: userProfile?.displayName || 'Student',
          email: userProfile?.email || ''
        }
      );
      recsResult = getTopicRecommendations(evaluationResult.weakTopics, quizzes, quiz.id);
    }

    // 2. Persist in Firestore
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'attempts', evaluationResult.id), evaluationResult);
      } catch (err) {
        console.warn('Firestore attempt save fallback:', err);
      }
    }

    // 3. Save locally in attempts list & localStorage
    const nextAttempts = [evaluationResult, ...attempts];
    setAttempts(nextAttempts);
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(nextAttempts));

    setActiveAttempt(evaluationResult);

    return { evaluation: evaluationResult, recommendations: recsResult };
  };

  // Compute all weak topics (< 50% accuracy) for user
  const getWeakTopicsForUser = (userId?: string): string[] => {
    const targetUid = userId || userProfile?.id || user?.uid;
    const userAtts = targetUid ? attempts.filter(a => a.userId === targetUid) : attempts;
    
    if (userAtts.length === 0) return [];

    // Accumulate topic performance across all attempts
    const topicTotals: Record<string, { total: number; correct: number }> = {};
    for (const att of userAtts) {
      for (const tb of att.topicBreakdown) {
        if (!topicTotals[tb.topic]) {
          topicTotals[tb.topic] = { total: 0, correct: 0 };
        }
        topicTotals[tb.topic].total += tb.total;
        topicTotals[tb.topic].correct += tb.correct;
      }
    }

    const weak: string[] = [];
    for (const [topic, stats] of Object.entries(topicTotals)) {
      if (stats.total > 0) {
        const acc = Math.round((stats.correct / stats.total) * 100);
        if (acc < 50) {
          weak.push(topic);
        }
      }
    }

    return weak;
  };

  // Get recommendations for user based on historical weak topics
  const getRecommendationsForUser = (userId?: string): RecommendedQuizItem[] => {
    const weakTopics = getWeakTopicsForUser(userId);
    return getTopicRecommendations(weakTopics, quizzes);
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        attempts,
        activeAttempt,
        isLoading,
        setActiveAttempt,
        getQuizById,
        getQuizByCode,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        togglePublishQuiz,
        submitQuizAttempt,
        getWeakTopicsForUser,
        getRecommendationsForUser,
        refreshData: loadInitialData
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
