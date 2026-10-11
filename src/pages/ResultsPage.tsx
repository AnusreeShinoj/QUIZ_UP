import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  BarChart3, 
  Target, 
  RotateCcw, 
  Compass, 
  ArrowRight, 
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { QuizAttempt, RecommendedQuizItem } from '../types/quiz';
import { QuizCard } from '../components/QuizCard';

interface ResultsPageProps {
  attempt?: QuizAttempt | null;
  onRetake: (quizId: string) => void;
  onExplore: () => void;
  onViewProgress: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  attempt: passedAttempt,
  onRetake,
  onExplore,
  onViewProgress
}) => {
  const { activeAttempt, attempts, getRecommendationsForUser } = useQuiz();
  const attempt = passedAttempt || activeAttempt || attempts[0];

  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [expandedExplanation, setExpandedExplanation] = useState<Record<string, boolean>>({});

  // Fire celebratory confetti if high score
  useEffect(() => {
    if (attempt && attempt.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [attempt?.id]);

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Assessment Result Available</h2>
        <p className="text-xs text-slate-500">
          Attempt a quiz first to inspect server evaluation reports and topic performance analytics.
        </p>
        <button
          onClick={onExplore}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Explore Available Quizzes
        </button>
      </div>
    );
  }

  // Get recommendations for weak topics (<50%)
  const recommendations: RecommendedQuizItem[] = getRecommendationsForUser(attempt.userId);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const filteredReviews = attempt.questionReviews.filter(r => {
    if (questionFilter === 'correct') return r.isCorrect;
    if (questionFilter === 'incorrect') return !r.isCorrect && r.selectedOption !== null;
    if (questionFilter === 'unanswered') return r.selectedOption === null;
    return true;
  });

  const toggleExplanation = (qId: string) => {
    setExpandedExplanation(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Evaluation Completed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {attempt.quizTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Subject: <strong className="text-slate-800">{attempt.quizSubject}</strong></span>
            <span>·</span>
            <span>Topic: <strong className="text-slate-800">{attempt.quizTopic}</strong></span>
            <span>·</span>
            <span>{new Date(attempt.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onRetake(attempt.quizId)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-purple-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-purple-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
          <button
            onClick={onViewProgress}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>View Progress</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Score */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Score</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.maxScore}</span>
          </div>
        </div>

        {/* Percentage */}
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Percentage</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            attempt.percentage >= 70 ? 'text-emerald-600' : attempt.percentage >= 50 ? 'text-purple-600' : 'text-amber-600'
          }`}>
            {attempt.percentage}%
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Accuracy</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {attempt.accuracy}%
          </div>
        </div>

        {/* Correct Answers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Correct</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {attempt.correctAnswers}
          </div>
        </div>

        {/* Incorrect Answers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase">Incorrect</div>
          <div className="text-2xl font-bold text-rose-700 font-mono mt-1">
            {attempt.incorrectAnswers}
          </div>
        </div>

        {/* Time Taken */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Time Spent</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatDuration(attempt.timeTakenSeconds)}
          </div>
        </div>

      </div>

      {/* TOPIC-WISE ANALYSIS & WEAKNESS DIAGNOSIS (<50%) */}
      <section className="bg-white rounded-xl border border-purple-100 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Diagnostic Assessment</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Topic-Wise Performance Breakdown
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Rule Applied: Any topic with accuracy below 50% triggers practice recommendations.
          </p>
        </div>

        {/* Topic Breakdown Bars & Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attempt.topicBreakdown.map((tb) => {
            const isWeak = tb.needsPractice; // < 50%
            return (
              <div
                key={tb.topic}
                className={`p-4 rounded-xl border transition-all ${
                  isWeak
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-purple-100 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-900">
                    {tb.topic}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    isWeak
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}>
                    {isWeak ? '⚠️ Needs Practice (<50%)' : '✓ Proficient (≥50%)'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isWeak ? 'bg-amber-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${tb.accuracy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>
                    {tb.correct} of {tb.total} questions correct
                  </span>
                  <span className="font-bold text-slate-800">
                    {tb.accuracy}% Accuracy
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED PRACTICE QUIZZES (Conditional JS Matching) */}
      {recommendations.length > 0 && (
        <section className="bg-purple-50/50 rounded-2xl border border-purple-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Targeted Remediation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Recommended Practice Quizzes for Weak Topics
            </h2>
            <p className="text-xs text-slate-600">
              Selected via deterministic rules based on syllabus topics where accuracy was below 50%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((item) => (
              <div key={item.quiz.id} className="flex flex-col">
                <div className="mb-2 text-xs font-medium text-amber-800 bg-amber-100/70 border border-amber-200 rounded-lg p-2 leading-relaxed">
                  {item.relevanceReason}
                </div>
                <QuizCard
                  quiz={item.quiz}
                  onTakeQuiz={onRetake}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DETAILED QUESTION-BY-QUESTION REVIEW */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detailed Question Review &amp; Explanations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your chosen answer against the verified answer and read the educational rationale.
            </p>
          </div>

          {/* Review Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setQuestionFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                questionFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({attempt.questionReviews.length})
            </button>
            <button
              onClick={() => setQuestionFilter('correct')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                questionFilter === 'correct'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({attempt.correctAnswers})
            </button>
            <button
              onClick={() => setQuestionFilter('incorrect')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                questionFilter === 'incorrect'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect ({attempt.incorrectAnswers})
            </button>
            <button
              onClick={() => setQuestionFilter('unanswered')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                questionFilter === 'unanswered'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unanswered ({attempt.unanswered})
            </button>
          </div>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-4">
          {filteredReviews.map((rev, idx) => {
            const optionLetters = ['A', 'B', 'C', 'D'];
            const isAnswered = rev.selectedOption !== null && rev.selectedOption !== undefined;
            const isExpanded = expandedExplanation[rev.questionId] ?? true;

            return (
              <div
                key={rev.questionId}
                className={`rounded-xl border p-5 transition-all space-y-4 ${
                  rev.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isAnswered
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">
                      Q{idx + 1}.
                    </span>
                    <span className="text-slate-500">
                      Topic: <strong className="text-slate-800">{rev.topic}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rev.isCorrect ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct (+{rev.pointsEarned})
                      </span>
                    ) : isAnswered ? (
                      <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect (0 pts)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                        Unanswered
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <h4 className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {rev.questionText}
                </h4>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {rev.options.map((opt, optIdx) => {
                    const isChosen = rev.selectedOption === optIdx;
                    const isTrueCorrect = rev.correctOption === optIdx;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    if (isTrueCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                    } else if (isChosen && !rev.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 font-mono font-bold text-slate-500">
                            {optionLetters[optIdx]}.
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isTrueCorrect && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                            Correct Answer
                          </span>
                        )}
                        {isChosen && !isTrueCorrect && (
                          <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-200 px-1.5 py-0.5 rounded shrink-0">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Educational Explanation Box */}
                <div className="pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => toggleExplanation(rev.questionId)}
                    className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
                  >
                    <span>Concept &amp; Explanation</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                      {rev.explanation}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
