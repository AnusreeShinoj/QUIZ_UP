import React from 'react';
import { 
  Clock, 
  HelpCircle, 
  Play, 
  Copy, 
  Check
} from 'lucide-react';
import { Quiz } from '../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
  onTakeQuiz: (quizId: string) => void;
  onShareQuiz?: (quiz: Quiz) => void;
  showCreator?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onTakeQuiz,
  onShareQuiz,
  showCreator = true
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(quiz.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Advanced':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-purple-100 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        
        {/* Subject kicker & Difficulty */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <span className="font-semibold text-purple-700 tracking-wide uppercase text-[11px]">
            {quiz.subject}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Clean Metadata */}
        <div className="mt-4 pt-3 border-t border-purple-50 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {quiz.totalQuestions || quiz.questions.length} questions
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} mins` : 'Untimed'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-600">
            {quiz.examCategory}
          </span>
        </div>

        {/* Topic Tag */}
        <div className="mt-2 text-[11px] text-slate-500 font-mono">
          Topic: <span className="text-slate-700 font-medium">{quiz.topic}</span>
        </div>
      </div>

      {/* Footer action bar */}
      <div className="px-5 py-3.5 bg-purple-50/40 border-t border-purple-100/60 flex items-center justify-between gap-3">
        {/* Share code pill button */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="font-mono text-slate-400">Code:</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-purple-200 rounded font-mono font-semibold text-purple-800 hover:border-purple-400 transition-colors text-xs"
            title="Click to copy quiz code"
          >
            {quiz.shareCode}
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>

        {/* Attempt Quiz CTA */}
        <button
          onClick={() => onTakeQuiz(quiz.id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Attempt</span>
        </button>
      </div>
    </div>
  );
};
