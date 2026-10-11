import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Filter, 
  RotateCcw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';

interface MyProgressPageProps {
  onViewAttempt: (attemptId: string) => void;
  onTakeQuiz: (quizId: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const MyProgressPage: React.FC<MyProgressPageProps> = ({
  onViewAttempt,
  onTakeQuiz,
  setCurrentTab
}) => {
  const { attempts, getWeakTopicsForUser } = useQuiz();
  const { userProfile } = useAuth();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Filter attempts for current user
  const userAttempts = useMemo(() => {
    const uid = userProfile?.id;
    const list = uid ? attempts.filter(a => a.userId === uid) : attempts;
    // Chronological ascending for trend chart, descending for table
    return list;
  }, [attempts, userProfile]);

  const chronologicalAttempts = useMemo(() => {
    return [...userAttempts].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [userAttempts]);

  // Unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    userAttempts.forEach(a => set.add(a.quizSubject));
    return ['All', ...Array.from(set)];
  }, [userAttempts]);

  const filteredAttempts = useMemo(() => {
    if (selectedSubjectFilter === 'All') return userAttempts;
    return userAttempts.filter(a => a.quizSubject === selectedSubjectFilter);
  }, [userAttempts, selectedSubjectFilter]);

  // Aggregate cumulative topic performance
  const topicMastery = useMemo(() => {
    const topicMap: Record<string, { total: number; correct: number }> = {};
    for (const att of userAttempts) {
      for (const tb of att.topicBreakdown) {
        if (!topicMap[tb.topic]) {
          topicMap[tb.topic] = { total: 0, correct: 0 };
        }
        topicMap[tb.topic].total += tb.total;
        topicMap[tb.topic].correct += tb.correct;
      }
    }

    const mastered: { topic: string; acc: number; total: number }[] = [];
    const developing: { topic: string; acc: number; total: number }[] = [];
    const needsPractice: { topic: string; acc: number; total: number }[] = [];

    Object.entries(topicMap).forEach(([t, s]) => {
      const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      if (acc >= 75) {
        mastered.push({ topic: t, acc, total: s.total });
      } else if (acc >= 50) {
        developing.push({ topic: t, acc, total: s.total });
      } else {
        needsPractice.push({ topic: t, acc, total: s.total });
      }
    });

    return { mastered, developing, needsPractice };
  }, [userAttempts]);

  // Metrics
  const totalAttemptsCount = userAttempts.length;
  const avgPercentage = totalAttemptsCount > 0
    ? Math.round(userAttempts.reduce((s, a) => s + a.percentage, 0) / totalAttemptsCount)
    : 0;
  const totalCorrect = userAttempts.reduce((s, a) => s + a.correctAnswers, 0);
  const totalQuestionsAnswered = userAttempts.reduce((s, a) => s + (a.correctAnswers + a.incorrectAnswers), 0);
  const overallAccuracy = totalQuestionsAnswered > 0
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
    : 0;

  // Render SVG Chart for Score Improvement Over Time
  const renderTrendChart = () => {
    if (chronologicalAttempts.length < 2) {
      return (
        <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
          <TrendingUp className="w-6 h-6 text-slate-300" />
          <span>Complete 2 or more quizzes to view your performance progression graph.</span>
        </div>
      );
    }

    const width = 600;
    const height = 180;
    const padding = 35;

    const points = chronologicalAttempts.map((att, idx) => {
      const x = padding + (idx / (chronologicalAttempts.length - 1)) * (width - 2 * padding);
      const y = height - padding - (att.percentage / 100) * (height - 2 * padding);
      return { x, y, percentage: att.percentage, title: att.quizTitle, date: new Date(att.submittedAt).toLocaleDateString() };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full overflow-x-auto py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = height - padding - (val / 100) * (height - 2 * padding);
            return (
              <g key={val}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontFamily="monospace">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* 50% benchmark line (threshold for needs practice) */}
          <line
            x1={padding}
            y1={height - padding - 0.5 * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - 0.5 * (height - 2 * padding)}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaD} fill="rgba(124, 58, 237, 0.12)" />

          {/* Trend line */}
          <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#4C1D95"
                stroke="#A855F7"
                strokeWidth="2"
                className="hover:r-6 cursor-pointer transition-all"
              >
                <title>{`${p.title}: ${p.percentage}% on ${p.date}`}</title>
              </circle>
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#0F172A"
                fontFamily="monospace"
              >
                {p.percentage}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Diagnostic Learning Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Learning Progress &amp; Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your academic improvement over time, lifetime topic mastery, and detailed quiz logs.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('explore')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Attempt More Quizzes</span>
        </button>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Evaluations</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {totalAttemptsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Submitted assessments</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Mean Score</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            avgPercentage >= 70 ? 'text-emerald-600' : 'text-slate-900'
          }`}>
            {avgPercentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Average marks percentage</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase">Total Accuracy</div>
          <div className="text-2xl font-bold text-purple-700 font-mono mt-1">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{totalCorrect}/{totalQuestionsAnswered} questions right</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">Remediation Targets</div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {topicMastery.needsPractice.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Topics scoring &lt; 50%</div>
        </div>

      </div>

      {/* Chart: Score Improvement Over Time */}
      <section className="bg-white rounded-xl border border-purple-100 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-1.5 text-purple-700 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Score Progression</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Performance Trend Across Submissions
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>Score %</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-amber-500 inline-block" />
              <span>50% Threshold</span>
            </span>
          </div>
        </div>

        {renderTrendChart()}
      </section>

      {/* Lifetime Topic Mastery Columns */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Lifetime Topic Mastery Diagnosis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated accuracy across all questions you have ever attempted across the college curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Needs Practice (< 50%) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Needs Practice (&lt; 50%)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-amber-800">
                {topicMastery.needsPractice.length}
              </span>
            </div>
            {topicMastery.needsPractice.length > 0 ? (
              <div className="space-y-2">
                {topicMastery.needsPractice.map(t => (
                  <div key={t.topic} className="p-2.5 bg-white border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>{t.topic}</span>
                      <span className="font-mono text-amber-700 font-bold">{t.acc}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Tested {t.total} times</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-[11px] text-amber-700 italic">
                No weak topics diagnosed under 50%.
              </div>
            )}
          </div>

          {/* Developing (50% - 74%) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Developing (50% - 74%)
              </h3>
              <span className="font-mono text-xs font-bold text-slate-700">
                {topicMastery.developing.length}
              </span>
            </div>
            {topicMastery.developing.length > 0 ? (
              <div className="space-y-2">
                {topicMastery.developing.map(t => (
                  <div key={t.topic} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>{t.topic}</span>
                      <span className="font-mono text-slate-700 font-bold">{t.acc}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Tested {t.total} times</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-[11px] text-slate-500 italic">
                No topics in developing range.
              </div>
            )}
          </div>

          {/* Mastered (>= 75%) */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Mastered (≥ 75%)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-purple-800">
                {topicMastery.mastered.length}
              </span>
            </div>
            {topicMastery.mastered.length > 0 ? (
              <div className="space-y-2">
                {topicMastery.mastered.map(t => (
                  <div key={t.topic} className="p-2.5 bg-white border border-purple-200 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>{t.topic}</span>
                      <span className="font-mono text-purple-700 font-bold">{t.acc}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Tested {t.total} times</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-[11px] text-purple-700 italic">
                Achieve ≥75% in a topic to earn mastery status.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Comprehensive Quiz Attempt History Table */}
      <section className="bg-white rounded-xl border border-purple-100 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluated Assessment History ({filteredAttempts.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "View Analysis" on any attempt to inspect question-by-question explanations.
            </p>
          </div>

          {/* Filter by Subject */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-purple-200 rounded-md text-slate-800 focus:bg-white focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-purple-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Quiz Title</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Marks</th>
                  <th className="py-3 px-4 font-semibold">Score %</th>
                  <th className="py-3 px-4 font-semibold">Accuracy</th>
                  <th className="py-3 px-4 font-semibold">Date Completed</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-700">
                {filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {att.quizTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {att.quizSubject}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {att.score}/{att.maxScore}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        att.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : att.percentage >= 50 ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {att.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewAttempt(att.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-colors"
                      >
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No attempts matching this subject filter.</p>
          </div>
        )}
      </section>

    </div>
  );
};
