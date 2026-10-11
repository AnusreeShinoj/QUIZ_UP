import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  BookOpen, 
  Play, 
  Share2, 
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { Quiz } from '../types/quiz';

interface MyQuizzesPageProps {
  onCreateQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
}

export const MyQuizzesPage: React.FC<MyQuizzesPageProps> = ({
  onCreateQuiz,
  onEditQuiz,
  onTakeQuiz
}) => {
  const { quizzes, deleteQuiz, togglePublishQuiz } = useQuiz();
  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalQuiz, setDeleteModalQuiz] = useState<Quiz | null>(null);

  // Filter quizzes owned by the current user
  // (Also include seed quizzes if demo faculty or demo user wants to edit/manage them for presentation)
  const myQuizzes = useMemo(() => {
    const currentUid = userProfile?.id;
    return quizzes.filter(q => {
      if (q.creatorId === currentUid) return true;
      // Allow faculty persona to manage all curriculum quizzes during review
      if (userProfile?.role === 'educator') return true;
      return false;
    });
  }, [quizzes, userProfile]);

  const displayedQuizzes = useMemo(() => {
    if (activeTab === 'published') {
      return myQuizzes.filter(q => q.isPublished);
    }
    if (activeTab === 'drafts') {
      return myQuizzes.filter(q => !q.isPublished);
    }
    return myQuizzes;
  }, [myQuizzes, activeTab]);

  const handleCopyCode = (quiz: Quiz) => {
    navigator.clipboard.writeText(quiz.shareCode);
    setCopiedId(quiz.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalQuiz) return;
    await deleteQuiz(deleteModalQuiz.id);
    setDeleteModalQuiz(null);
  };

  const publishedCount = myQuizzes.filter(q => q.isPublished).length;
  const draftCount = myQuizzes.filter(q => !q.isPublished).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Author &amp; Faculty Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Quizzes &amp; Drafts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your created assessments, edit question banks, toggle publication, or copy private codes.
          </p>
        </div>

        <button
          onClick={onCreateQuiz}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Quizzes</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{myQuizzes.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-medium">Published Live</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{publishedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-medium">Drafts Pending</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{draftCount}</div>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({myQuizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'published'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'drafts'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Quizzes List */}
      {displayedQuizzes.length > 0 ? (
        <div className="space-y-4">
          {displayedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    quiz.isPublished 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {quiz.isPublished ? '● Published' : '○ Draft'}
                  </span>
                  <span className="text-purple-700 font-semibold">{quiz.subject}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600">{quiz.topic}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500">{quiz.difficulty}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>

                {/* Metadata details */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                  <span>{quiz.totalQuestions || quiz.questions.length} Questions</span>
                  <span aria-hidden="true">·</span>
                  <span>{quiz.totalPoints} Marks</span>
                  <span aria-hidden="true">·</span>
                  <span>{quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} mins` : 'Untimed'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">Code:</span>
                  <button
                    onClick={() => handleCopyCode(quiz)}
                    className="flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 hover:border-purple-300 transition-colors text-xs"
                    title="Click to copy share code"
                  >
                    <span>{quiz.shareCode}</span>
                    {copiedId === quiz.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Take / Preview */}
                <button
                  onClick={() => onTakeQuiz(quiz.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Attempt this quiz"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Attempt</span>
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEditQuiz(quiz.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                  title="Edit Quiz"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Publish Toggle */}
                <button
                  onClick={() => togglePublishQuiz(quiz.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    quiz.isPublished
                      ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={quiz.isPublished ? 'Unpublish quiz (make draft)' : 'Publish quiz publicly'}
                >
                  {quiz.isPublished ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteModalQuiz(quiz)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No assessments created yet</h3>
            <p className="text-xs text-slate-500">
              Draft your first technical quiz for classroom study, exam preparation, or sharing with peers.
            </p>
          </div>
          <button
            onClick={onCreateQuiz}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Quiz</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete Assessment?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <strong>"{deleteModalQuiz.title}"</strong>? 
                  This will remove all questions and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteModalQuiz(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Yes, Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
