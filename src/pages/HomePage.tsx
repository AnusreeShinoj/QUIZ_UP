import React, { useState } from 'react';
import { 
  ArrowRight, 
  Target, 
  ShieldCheck, 
  KeyRound, 
  GraduationCap
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { QuizCard } from '../components/QuizCard';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onTakeQuiz: (quizId: string) => void;
  openCodeModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentTab,
  onTakeQuiz,
  openCodeModal
}) => {
  const { quizzes, getQuizByCode } = useQuiz();
  const [quickCode, setQuickCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const featuredQuizzes = quizzes.filter(q => q.isPublished).slice(0, 6);

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    setCodeError(null);
    const quiz = await getQuizByCode(quickCode.trim());
    if (quiz) {
      onTakeQuiz(quiz.id);
    } else {
      setCodeError(`No quiz with code "${quickCode.toUpperCase()}". Try DSA101 or OS202.`);
    }
  };

  return (
    <div className="space-y-8 pb-16 bg-purple-50/40 min-h-screen">
      
      {/* Light Purple Hero Section */}
      <section className="bg-white border-b border-purple-100 py-8 sm:py-12 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>QuizUp</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quiz<span className="text-purple-600">Up</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Take quizzes, track accuracy by topic, and practice areas needing improvement.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setCurrentTab('login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentTab('explore')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-purple-50 border border-purple-200 text-purple-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Explore Quizzes</span>
            </button>

            <button
              onClick={openCodeModal}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Enter Code</span>
            </button>
          </div>

          {/* Fast Quiz Code Input */}
          <form onSubmit={handleQuickJoin} className="pt-2 max-w-xs mx-auto">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={quickCode}
                onChange={(e) => {
                  setQuickCode(e.target.value.toUpperCase());
                  setCodeError(null);
                }}
                placeholder="Enter Code (e.g. DSA101)"
                className="grow px-3 py-1.5 text-xs bg-slate-50 border border-purple-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
            {codeError && (
              <p className="mt-1 text-xs text-red-600 font-medium">{codeError}</p>
            )}
          </form>

        </div>
      </section>

      {/* 3 Quick Features - Concise */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Instant Evaluation</h3>
            <p className="text-[11px] text-slate-500">
              Evaluates submitted answers and calculates score instantly.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Topic-Wise Analysis</h3>
            <p className="text-[11px] text-slate-500">
              Flags topics below 50% accuracy with practice recommendations.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-1">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Easy Sharing</h3>
            <p className="text-[11px] text-slate-500">
              Share assessments with peers using unique quiz codes.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="max-w-6xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Featured Quizzes</h2>
          <button
            onClick={() => setCurrentTab('explore')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>View All ({quizzes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onTakeQuiz={onTakeQuiz}
            />
          ))}
        </div>
      </section>

      {/* Light Purple CTA Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900">
              Create your own quizzes
            </h3>
            <p className="text-xs text-slate-600">
              Add multiple-choice questions, set topic tags, and share with your class.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('create')}
            className="shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
          >
            Create Quiz
          </button>
        </div>
      </section>

    </div>
  );
};
