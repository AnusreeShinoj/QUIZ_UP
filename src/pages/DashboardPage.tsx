import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  KeyRound, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { QuizCard } from '../components/QuizCard';

interface DashboardPageProps {
  onTakeQuiz: (quizId: string) => void;
  onViewAttempt: (attemptId: string) => void;
  setCurrentTab: (tab: string) => void;
  openCodeModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onTakeQuiz,
  onViewAttempt,
  setCurrentTab,
  openCodeModal
}) => {
  const { attempts, getWeakTopicsForUser, getRecommendationsForUser } = useQuiz();
  const { userProfile } = useAuth();

  // Filter attempts for current user
  const userAttempts = useMemo(() => {
    const uid = userProfile?.id;
    return uid ? attempts.filter(a => a.userId === uid) : attempts;
  }, [attempts, userProfile]);

  // Aggregate stats
  const totalCompleted = userAttempts.length;
  const avgScorePercent = totalCompleted > 0
    ? Math.round(userAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalCompleted)
    : 0;
  const avgAccuracy = totalCompleted > 0
    ? Math.round(userAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalCompleted)
    : 0;

  // Weak topics (< 50% accuracy)
  const weakTopics = useMemo(() => {
    return getWeakTopicsForUser(userProfile?.id);
  }, [getWeakTopicsForUser, userProfile]);

  // Recommendations based on weak topics
  const recommendations = useMemo(() => {
    return getRecommendationsForUser(userProfile?.id);
  }, [getRecommendationsForUser, userProfile]);

  const recentAttempts = userAttempts.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-purple-700 text-xs font-semibold uppercase tracking-wider">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {userProfile?.displayName || 'Student'}
          </h1>
          <p className="text-xs text-slate-500">
            {userProfile?.college || 'B.Tech IT'} · Performance &amp; practice recommendations
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentTab('explore')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-purple-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse</span>
          </button>
          <button
            onClick={openCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors border border-purple-200"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Join Code</span>
          </button>
          <button
            onClick={() => setCurrentTab('create')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Quizzes Completed</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Evaluated attempts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Average Score</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            avgScorePercent >= 70 ? 'text-emerald-600' : avgScorePercent >= 50 ? 'text-purple-600' : 'text-slate-900'
          }`}>
            {avgScorePercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all quizzes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Overall Accuracy</div>
          <div className="text-2xl font-bold text-purple-700 font-mono mt-1">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Correct answer ratio</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">Weak Topics</div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {weakTopics.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">&lt; 50% accuracy</div>
        </div>

      </div>

      {/* WEAK TOPICS REMEDIATION & PRACTICE RECOMMENDATIONS */}
      {weakTopics.length > 0 ? (
        <section className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recommended Practice</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Topics Below 50% Accuracy
            </h2>
            <p className="text-xs text-slate-600">
              Practice these topics to boost your score:
            </p>
          </div>

          {/* Weak Topics Tag List */}
          <div className="flex flex-wrap gap-1.5">
            {weakTopics.map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold text-amber-900"
              >
                ⚠️ {topic}
              </span>
            ))}
          </div>

          {/* Recommended Quizzes Cards */}
          {recommendations.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Practice Quizzes:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((item) => (
                  <div key={item.quiz.id} className="flex flex-col">
                    <div className="mb-1.5 text-xs font-medium text-amber-900 bg-amber-100 border border-amber-200 rounded-lg p-2">
                      {item.relevanceReason}
                    </div>
                    <QuizCard
                      quiz={item.quiz}
                      onTakeQuiz={onTakeQuiz}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : totalCompleted > 0 ? (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 flex items-center gap-3 text-purple-900 text-xs">
          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <strong>Great job!</strong> All evaluated topics are at or above 50% accuracy.
          </span>
        </div>
      ) : null}

      {/* Recent Quiz Attempts */}
      <section className="bg-white rounded-xl border border-purple-100 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Quiz Attempts</h2>
            <p className="text-xs text-slate-500">
              View your evaluated quizzes and question feedback.
            </p>
          </div>
          {userAttempts.length > 0 && (
            <button
              onClick={() => setCurrentTab('progress')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>History ({userAttempts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-purple-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Quiz Title</th>
                  <th className="py-2.5 px-3 font-semibold">Subject</th>
                  <th className="py-2.5 px-3 font-semibold">Score</th>
                  <th className="py-2.5 px-3 font-semibold">Percentage</th>
                  <th className="py-2.5 px-3 font-semibold">Accuracy</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {recentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {att.quizTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {att.quizSubject}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">
                      {att.score}/{att.maxScore}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        att.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : att.percentage >= 50 ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {att.accuracy}%
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewAttempt(att.id)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <BookOpen className="w-7 h-7 text-purple-300 mx-auto" />
            <p className="text-xs text-slate-500">No quizzes attempted yet.</p>
            <button
              onClick={() => setCurrentTab('explore')}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Take a Quiz
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
