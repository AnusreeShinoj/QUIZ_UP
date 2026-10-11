import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Flag, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Send, 
  ShieldCheck,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { Quiz, ClientQuestion } from '../types/quiz';

interface QuizAttemptPageProps {
  quizId: string;
  onFinish: () => void;
  onCancel: () => void;
}

export const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({
  quizId,
  onFinish,
  onCancel
}) => {
  const { getQuizById, submitQuizAttempt } = useQuiz();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Student answers map: { [questionId]: optionIndex | null }
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  // Flagged for review set: question IDs
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Fetch quiz (sanitized so correct answers are not exposed!)
  useEffect(() => {
    let mounted = true;
    const fetchQuizData = async () => {
      setLoading(true);
      const data = await getQuizById(quizId, 'take');
      if (mounted) {
        if (data) {
          setQuiz(data);
          // Initialize answers
          const initialAns: Record<string, number | null> = {};
          data.questions.forEach(q => {
            initialAns[q.id] = null;
          });
          setAnswers(initialAns);

          // Timer initialization
          if (data.timeLimitMinutes && data.timeLimitMinutes > 0) {
            setSecondsRemaining(data.timeLimitMinutes * 60);
          } else {
            setSecondsRemaining(null);
          }
        }
        setLoading(false);
      }
    };
    fetchQuizData();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  // Timer interval
  useEffect(() => {
    if (loading || !quiz) return;

    const timer = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);

      setSecondsRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time expiry!
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quiz]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quiz) return;
      if (showSubmitModal || showExitModal) return;

      const q = quiz.questions[currentQIndex];
      if (!q) return;

      // 1, 2, 3, 4 select options
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key) - 1;
        if (optIdx < q.options.length) {
          handleSelectOption(q.id, optIdx);
        }
      }
      // Arrow keys navigation
      if (e.key === 'ArrowRight' && currentQIndex < quiz.questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentQIndex > 0) {
        setCurrentQIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentQIndex, showSubmitModal, showExitModal]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleClearOption = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: null
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSubmitAnswers = async () => {
    if (!quiz || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitQuizAttempt(quiz.id, answers, timeSpentSeconds);
      setShowSubmitModal(false);
      onFinish();
    } catch (err) {
      console.error('Error submitting quiz answers:', err);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">
          Loading assessment and synchronizing test session...
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Assessment Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested quiz could not be loaded or has been unpublished.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQIndex];
  const totalQuestions = quiz.questions.length;

  // Answer stats
  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedIds.size;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Format time remaining
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining !== null && secondsRemaining <= 120; // < 2 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Test Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white text-slate-900 border-b border-purple-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Title & Subject */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-md hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors"
              title="Leave assessment"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="max-w-md">
              <h2 className="text-sm font-bold text-slate-900 truncate">{quiz.title}</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-purple-700 font-semibold">{quiz.subject}</span>
                <span>·</span>
                <span>Question {currentQIndex + 1} of {totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Center Timer */}
          {secondsRemaining !== null ? (
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
              isLowTime
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-purple-50 text-purple-800 border-purple-200'
            }`}>
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{formatTime(secondsRemaining)}</span>
              {isLowTime && <span className="text-[10px] uppercase font-sans">Warning</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Elapsed: {formatTime(timeSpentSeconds)}</span>
            </div>
          )}

          {/* Right Finish Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>Finish &amp; Submit</span>
            </button>
          </div>

        </div>

        {/* Progress Strip */}
        <div className="w-full bg-purple-100 h-1">
          <div 
            className="bg-purple-600 h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Assessment Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grow flex flex-col lg:flex-row gap-6 w-full">
        
        {/* Left Column: Active Question */}
        <main className="grow flex flex-col justify-between bg-white rounded-xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
          
          <div className="space-y-6">
            
            {/* Question Header & Kicker */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                  Q{currentQIndex + 1}
                </span>
                <span className="text-slate-500 font-medium">
                  Topic: <strong className="text-slate-800">{currentQ.topic}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">
                  +{currentQ.points || 1} {currentQ.points === 1 ? 'Mark' : 'Marks'}
                </span>
                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    flaggedIds.has(currentQ.id)
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Flag this question to review later"
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedIds.has(currentQ.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{flaggedIds.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>
            </div>

            {/* Question Statement */}
            <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              {currentQ.text}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optText, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 text-slate-950 shadow-xs ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {optionLetters[optIdx]}
                    </div>
                    
                    <div className="text-sm pt-0.5 leading-relaxed grow font-normal">
                      {optText}
                    </div>

                    <div className="pt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Question Bottom Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              {answers[currentQ.id] !== null && answers[currentQ.id] !== undefined && (
                <button
                  onClick={() => handleClearOption(currentQ.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Choice</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentQIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>Review &amp; Submit</span>
                </button>
              )}
            </div>
          </div>

        </main>

        {/* Right Column: Question Navigation Palette */}
        <aside className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 h-fit">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-xs font-mono font-semibold text-purple-700">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* Grid of question buttons */}
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
              const isFlagged = flaggedIds.has(q.id);
              const isCurrent = currentQIndex === idx;

              let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
              if (isAnswered) {
                btnStyle = 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700';
              } else if (isFlagged) {
                btnStyle = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-10 rounded-lg font-mono text-xs font-bold border transition-all relative flex items-center justify-center ${btnStyle} ${
                    isCurrent ? 'ring-2 ring-slate-950 ring-offset-2' : ''
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ', Flagged' : ''}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-purple-600" />
                <span>Answered</span>
              </span>
              <span className="font-mono font-bold text-slate-800">{answeredCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-300" />
                <span>Unanswered</span>
              </span>
              <span className="font-mono font-bold text-slate-800">{unansweredCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-300" />
                <span>Flagged for Review</span>
              </span>
              <span className="font-mono font-bold text-slate-800">{flaggedCount}</span>
            </div>
          </div>

          {/* Server Security Notice */}
          <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              Evaluation is performed on the server. Answers cannot be accessed via client inspection.
            </span>
          </div>

        </aside>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Submit Assessment?</h3>
                <p className="text-xs text-slate-600">
                  Your responses will be transmitted to the server for marks calculation, accuracy evaluation, and topic diagnosis.
                </p>
              </div>
            </div>

            {/* Assessment summary breakdown */}
            <div className="bg-purple-50/40 rounded-lg p-3.5 border border-purple-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-500 text-[11px]">Answered</div>
                <div className="text-lg font-bold text-purple-700 font-mono mt-0.5">{answeredCount}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Unanswered</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${unansweredCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  {unansweredCount}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[11px]">Flagged</div>
                <div className="text-lg font-bold text-slate-700 font-mono mt-0.5">{flaggedCount}</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>You still have {unansweredCount} unanswered questions. Are you sure you wish to submit?</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswers}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating on Server...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Submit</span>
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Leave Assessment?</h3>
            <p className="text-xs text-slate-600">
              Your unsubmitted answers will be discarded. Are you sure you want to return to the quiz directory?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Stay Here
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg"
              >
                Exit Test
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
