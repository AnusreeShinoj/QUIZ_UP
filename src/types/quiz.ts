export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ExamCategory = 
  | 'GATE CS' 
  | 'University IT Exams' 
  | 'Technical Placements' 
  | 'General Skill Check' 
  | 'Certification';

export type QuizVisibility = 'public' | 'private' | 'unlisted';

export interface Question {
  id: string;
  text: string;
  topic: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

// Question shape sent to test taker (no answers or explanations)
export interface ClientQuestion {
  id: string;
  text: string;
  topic: string;
  options: string[];
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  examCategory: ExamCategory;
  visibility: QuizVisibility;
  shareCode: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  isPublished: boolean;
  timeLimitMinutes: number; // 0 = unlimited
  totalQuestions: number;
  totalPoints: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  attemptCount?: number;
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  accuracy: number; // percentage 0 - 100
  needsPractice: boolean; // accuracy < 50%
}

export interface QuestionReview {
  questionId: string;
  questionText: string;
  topic: string;
  options: string[];
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
  pointsEarned: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  quizSubject: string;
  quizTopic: string;
  difficulty: DifficultyLevel;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  accuracy: number;
  timeTakenSeconds: number;
  submittedAt: string;
  topicBreakdown: TopicPerformance[];
  weakTopics: string[];
  questionReviews: QuestionReview[];
}

export interface RecommendedQuizItem {
  quiz: Quiz;
  matchedWeakTopic: string;
  relevanceReason: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'student' | 'educator' | 'admin';
  college?: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}
