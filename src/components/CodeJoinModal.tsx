import React, { useState } from 'react';
import { KeyRound, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

interface CodeJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuiz: (quizId: string) => void;
}

export const CodeJoinModal: React.FC<CodeJoinModalProps> = ({
  isOpen,
  onClose,
  onSelectQuiz
}) => {
  const { getQuizByCode } = useQuiz();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a quiz code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const found = await getQuizByCode(code.trim());
      if (found) {
        onClose();
        setCode('');
        onSelectQuiz(found.id);
      } else {
        setError(`No quiz found matching code "${code.trim().toUpperCase()}". Try DSA101, OS202, NET303, DBMS04.`);
      }
    } catch (err) {
      setError('Could not verify quiz code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = ['DSA101', 'OS202', 'NET303', 'DBMS04', 'WEB505'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Join Quiz with Code</h3>
              <p className="text-[11px] text-slate-500">Enter access code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quiz Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="e.g. DSA101"
              maxLength={12}
              className="w-full px-4 py-2.5 bg-slate-50 border border-purple-200 rounded-xl text-slate-900 font-mono text-center tracking-widest text-lg font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-normal"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick sample chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Sample Codes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleCodes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCode(c)}
                  className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-xs font-mono font-semibold text-purple-700 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Join Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
