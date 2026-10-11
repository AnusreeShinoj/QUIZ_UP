import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_SEED_QUIZZES } from './src/data/seedQuizzes.ts';
import { Quiz } from './src/types/quiz.ts';
import { evaluateQuizSubmission, getTopicRecommendations, sanitizeQuizForTestTaker } from './src/utils/evaluation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache synced with client/Firestore store to ensure instant response & fallback
let quizzesStore: Quiz[] = [...INITIAL_SEED_QUIZZES];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'QuizUp Assessment Engine',
      quizzesLoaded: quizzesStore.length,
      timestamp: new Date().toISOString()
    });
  });

  // 2. List quizzes (supports filtering & search)
  app.get('/api/quizzes', (req, res) => {
    const { subject, difficulty, examCategory, search, creatorId } = req.query;
    
    let results = [...quizzesStore];

    if (creatorId) {
      results = results.filter(q => q.creatorId === creatorId);
    } else {
      // Non-creators only see published public/unlisted quizzes
      results = results.filter(q => q.isPublished && q.visibility !== 'private');
    }

    if (subject && subject !== 'All') {
      results = results.filter(q => q.subject.toLowerCase() === String(subject).toLowerCase());
    }

    if (difficulty && difficulty !== 'All') {
      results = results.filter(q => q.difficulty.toLowerCase() === String(difficulty).toLowerCase());
    }

    if (examCategory && examCategory !== 'All') {
      results = results.filter(q => q.examCategory.toLowerCase() === String(examCategory).toLowerCase());
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).toLowerCase();
      results = results.filter(quiz => 
        quiz.title.toLowerCase().includes(q) ||
        quiz.description.toLowerCase().includes(q) ||
        quiz.topic.toLowerCase().includes(q) ||
        quiz.subject.toLowerCase().includes(q) ||
        quiz.shareCode.toLowerCase().includes(q)
      );
    }

    // Return sanitized versions if listing publicly
    const sanitized = results.map(q => sanitizeQuizForTestTaker(q));
    res.json(sanitized);
  });

  // 3. Get quiz by share code (e.g. for private / shared quizzes)
  app.get('/api/quizzes/code/:code', (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const quiz = quizzesStore.find(q => q.shareCode.toUpperCase() === code);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found with this code' });
    }

    // Always sanitize answers for taker
    res.json(sanitizeQuizForTestTaker(quiz));
  });

  // 4. Get quiz by ID (sanitizes questions for test takers!)
  app.get('/api/quizzes/:id', (req, res) => {
    const { id } = req.params;
    const { mode, requesterId } = req.query;
    const quiz = quizzesStore.find(q => q.id === id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // If owner is editing, provide full quiz with answers
    if (mode === 'edit' && requesterId && quiz.creatorId === requesterId) {
      return res.json(quiz);
    }

    // Otherwise, sanitize answers so test takers cannot see answers in DevTools network tab!
    const sanitized = sanitizeQuizForTestTaker(quiz);
    res.json(sanitized);
  });

  // 5. Server-side Quiz Evaluation: Evaluates answers on server!
  app.post('/api/quizzes/:id/submit', (req, res) => {
    const { id } = req.params;
    const { answers, timeTakenSeconds, userId, userName, userEmail } = req.body;

    const quiz = quizzesStore.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found for evaluation' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers must be provided as an object' });
    }

    // Execute server-side scoring & topic analysis
    const evaluation = evaluateQuizSubmission(
      quiz,
      answers,
      Number(timeTakenSeconds) || 0,
      {
        uid: userId || 'anonymous',
        displayName: userName || 'Student',
        email: userEmail || ''
      }
    );

    // Increment quiz attempt count
    quiz.attemptCount = (quiz.attemptCount || 0) + 1;

    // Compute recommendations based on weak topics (< 50% accuracy)
    const recommendations = getTopicRecommendations(
      evaluation.weakTopics,
      quizzesStore,
      quiz.id
    );

    res.json({
      success: true,
      evaluation,
      recommendations
    });
  });

  // 6. Create / Save quiz
  app.post('/api/quizzes', (req, res) => {
    const newQuiz: Quiz = req.body;
    if (!newQuiz.title || !newQuiz.subject || !newQuiz.questions || newQuiz.questions.length === 0) {
      return res.status(400).json({ error: 'Quiz title, subject, and at least one question are required' });
    }

    // Generate unique shareCode if missing
    if (!newQuiz.shareCode) {
      const prefix = newQuiz.subject.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'Q');
      newQuiz.shareCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    newQuiz.id = newQuiz.id || `quiz-${Date.now()}`;
    newQuiz.createdAt = newQuiz.createdAt || new Date().toISOString();
    newQuiz.updatedAt = new Date().toISOString();
    newQuiz.totalQuestions = newQuiz.questions.length;
    newQuiz.totalPoints = newQuiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    newQuiz.attemptCount = 0;

    quizzesStore.unshift(newQuiz);
    res.status(201).json(newQuiz);
  });

  // 7. Update quiz
  app.put('/api/quizzes/:id', (req, res) => {
    const { id } = req.params;
    const index = quizzesStore.findIndex(q => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const updatedData = req.body;
    quizzesStore[index] = {
      ...quizzesStore[index],
      ...updatedData,
      id,
      updatedAt: new Date().toISOString(),
      totalQuestions: updatedData.questions?.length ?? quizzesStore[index].totalQuestions,
      totalPoints: updatedData.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) ?? quizzesStore[index].totalPoints
    };

    res.json(quizzesStore[index]);
  });

  // 8. Delete quiz
  app.delete('/api/quizzes/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = quizzesStore.length;
    quizzesStore = quizzesStore.filter(q => q.id !== id);

    if (quizzesStore.length === initialLen) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ success: true, message: 'Quiz deleted successfully' });
  });

  // 9. Recommendations endpoint for general dashboard
  app.post('/api/recommendations', (req, res) => {
    const { weakTopics, currentQuizId } = req.body;
    const recs = getTopicRecommendations(weakTopics || [], quizzesStore, currentQuizId);
    res.json(recs);
  });

  // Mount Vite or static production assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizUp Full-Stack server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start QuizUp server:', err);
});
