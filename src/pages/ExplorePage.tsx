import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookOpen, 
  SlidersHorizontal,
  Compass,
  KeyRound
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { QuizCard } from '../components/QuizCard';
import { DifficultyLevel, ExamCategory } from '../types/quiz';

interface ExplorePageProps {
  onTakeQuiz: (quizId: string) => void;
  openCodeModal: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onTakeQuiz,
  openCodeModal
}) => {
  const { quizzes } = useQuiz();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'questions'>('popular');

  // Extract unique subjects & categories
  const subjects = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach(q => {
      if (q.subject) set.add(q.subject);
    });
    return ['All', ...Array.from(set)];
  }, [quizzes]);

  const categories: string[] = [
    'All',
    'GATE CS',
    'University IT Exams',
    'Technical Placements',
    'General Skill Check',
    'Certification'
  ];

  const difficulties: string[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter & sort quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(q => {
        // Only show published quizzes to general explorer
        if (!q.isPublished) return false;

        // Search query
        if (searchQuery.trim()) {
          const s = searchQuery.toLowerCase().trim();
          const matchesTitle = q.title.toLowerCase().includes(s);
          const matchesDesc = q.description.toLowerCase().includes(s);
          const matchesTopic = q.topic.toLowerCase().includes(s);
          const matchesSub = q.subject.toLowerCase().includes(s);
          const matchesCode = q.shareCode.toLowerCase().includes(s);
          if (!matchesTitle && !matchesDesc && !matchesTopic && !matchesSub && !matchesCode) {
            return false;
          }
        }

        // Subject filter
        if (selectedSubject !== 'All' && q.subject !== selectedSubject) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && q.examCategory !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.attemptCount || 0) - (a.attemptCount || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'questions') {
          return b.questions.length - a.questions.length;
        }
        return 0;
      });
  }, [quizzes, searchQuery, selectedSubject, selectedDifficulty, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedDifficulty('All');
    setSelectedCategory('All');
    setSortBy('popular');
  };

  const isFiltered = 
    searchQuery.trim() !== '' || 
    selectedSubject !== 'All' || 
    selectedDifficulty !== 'All' || 
    selectedCategory !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Curriculum &amp; Exam Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter quizzes by subject, difficulty, or exam category.
          </p>
        </div>

        <button
          onClick={openCodeModal}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Join Private Quiz Code</span>
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-2xs space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quiz title, topic (e.g. Subnetting, B-Trees, Deadlocks), or share code..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Exam Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Exam Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Segmented Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            >
              {difficulties.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Recently Added</option>
              <option value="questions">Question Count</option>
            </select>
          </div>

        </div>

        {/* Filter status & Reset button */}
        {isFiltered && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>
              Showing {filteredQuizzes.length} matching {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-purple-700 hover:text-purple-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onTakeQuiz={onTakeQuiz}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No quizzes found</h3>
            <p className="text-xs text-slate-500">
              No published assessments match your current filter combination.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

    </div>
  );
};
