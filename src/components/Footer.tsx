import React from 'react';
import { GraduationCap } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-white text-slate-600 border-t border-purple-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Quiz<span className="text-purple-600">Up</span>
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-500">B.Tech IT Academic Assessment Platform</span>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button onClick={() => setCurrentTab('login')} className="hover:text-purple-700 transition-colors">
              Login
            </button>
            <button onClick={() => setCurrentTab('explore')} className="hover:text-purple-700 transition-colors">
              Explore
            </button>
            <button onClick={() => setCurrentTab('create')} className="hover:text-purple-700 transition-colors">
              Create Quiz
            </button>
            <button onClick={() => setCurrentTab('dashboard')} className="hover:text-purple-700 transition-colors">
              Dashboard
            </button>
            <button onClick={() => setCurrentTab('progress')} className="hover:text-purple-700 transition-colors">
              Progress
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 QuizUp. Web Application Development Project.</p>
          <p>Automated Topic Accuracy Evaluation Engine</p>
        </div>
      </div>
    </footer>
  );
};
