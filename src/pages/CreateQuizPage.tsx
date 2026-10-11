import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Layers, 
  Save, 
  Send, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { DifficultyLevel, ExamCategory, Question, Quiz, QuizVisibility } from '../types/quiz';

interface CreateQuizPageProps {
  editQuizId?: string | null;
  onSuccess: (quizId: string) => void;
  onCancel: () => void;
}

export const CreateQuizPage: React.FC<CreateQuizPageProps> = ({
  editQuizId,
  onSuccess,
  onCancel
}) => {
  const { quizzes, createQuiz, updateQuiz } = useQuiz();
  const { userProfile } = useAuth();

  const existingQuiz = editQuizId ? quizzes.find(q => q.id === editQuizId) : null;

  // Metadata state
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [subject, setSubject] = useState(existingQuiz?.subject || 'Information Technology');
  const [topic, setTopic] = useState(existingQuiz?.topic || 'Web Application Development');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(existingQuiz?.difficulty || 'Intermediate');
  const [examCategory, setExamCategory] = useState<ExamCategory>(existingQuiz?.examCategory || 'University IT Exams');
  const [visibility, setVisibility] = useState<QuizVisibility>(existingQuiz?.visibility || 'public');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(existingQuiz?.timeLimitMinutes ?? 10);
  const [shareCode, setShareCode] = useState(existingQuiz?.shareCode || '');

  // Questions dynamic list
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (existingQuiz?.questions && existingQuiz.questions.length > 0) {
      return existingQuiz.questions;
    }
    return [
      {
        id: 'q-' + Date.now() + '-1',
        text: 'What is the primary function of the HTTP 200 status code?',
        topic: 'Web Technologies',
        options: [
          'Resource Created',
          'Request OK & Successful',
          'Bad Request',
          'Internal Server Error'
        ],
        correctOptionIndex: 1,
        explanation: 'HTTP 200 OK indicates that the client request has succeeded and the response payload is returned.',
        points: 1
      },
      {
        id: 'q-' + Date.now() + '-2',
        text: 'In relational database design, what does First Normal Form (1NF) strictly enforce?',
        topic: 'Database Normalization',
        options: [
          'No transitive dependencies',
          'Elimination of repeating groups and atomic attribute values',
          'Every determinant must be a candidate key',
          'Foreign key referential integrity'
        ],
        correctOptionIndex: 1,
        explanation: '1NF requires all attributes in a relation to be atomic (indivisible) with no repeating groups.',
        points: 1
      }
    ];
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question manipulation
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: 'q-' + Date.now() + '-' + (questions.length + 1),
      text: '',
      topic: topic || 'General',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      points: 1
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleDuplicateQuestion = (index: number) => {
    const source = questions[index];
    const duplicate: Question = {
      ...source,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      text: source.text + ' (Copy)'
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicate);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].text = val;
    setQuestions(updated);
  };

  const handleQuestionTopicChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].topic = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectOptionSelect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = optIndex;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = val;
    setQuestions(updated);
  };

  const handlePointsChange = (qIndex: number, val: number) => {
    const updated = [...questions];
    updated[qIndex].points = Math.max(1, val);
    setQuestions(updated);
  };

  // Submit Handler
  const handleSave = async (publishStatus: boolean) => {
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Quiz Title is required.');
      return;
    }
    if (!subject.trim()) {
      setError('Subject category is required.');
      return;
    }
    if (!topic.trim()) {
      setError('Primary topic is required.');
      return;
    }
    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} is missing its question statement.`);
        return;
      }
      if (!q.topic.trim()) {
        setError(`Question ${i + 1} must specify a topic for diagnostic analysis.`);
        return;
      }
      const filledOptions = q.options.filter(o => o.trim() !== '');
      if (filledOptions.length < 2) {
        setError(`Question ${i + 1} must contain at least 2 non-empty choices.`);
        return;
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        setError(`Question ${i + 1} must have a valid selected correct answer.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

      const payload = {
        title: title.trim(),
        description: description.trim() || `College assessment on ${topic}.`,
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        examCategory,
        visibility,
        shareCode: shareCode.trim().toUpperCase(),
        creatorId: userProfile?.id || 'demo-author',
        creatorName: userProfile?.displayName || 'Faculty / Student Creator',
        creatorEmail: userProfile?.email || '',
        isPublished: publishStatus,
        timeLimitMinutes: Number(timeLimitMinutes) || 0,
        totalQuestions: questions.length,
        totalPoints,
        questions
      };

      if (editQuizId) {
        await updateQuiz(editQuizId, payload);
        onSuccess(editQuizId);
      } else {
        const created = await createQuiz(payload);
        onSuccess(created.id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPointsSum = questions.reduce((s, q) => s + (q.points || 1), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel &amp; Return</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-500">
            {questions.length} Questions · {totalPointsSum} Total Marks
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {editQuizId ? 'Edit Assessment' : 'Create New Technical Assessment'}
        </h1>
        <p className="text-xs text-slate-500">
          Formulate questions with topic tags so the evaluation engine can diagnose student weak areas.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Part 1: Quiz Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          1. General Assessment Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems: Process Scheduling &amp; Semaphore Primitives"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Category *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Information Technology or Computer Science"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Primary Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Syllabus Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Operating Systems, Subnetting, or Data Structures"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Examination Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Examination Focus
            </label>
            <select
              value={examCategory}
              onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            >
              <option value="University IT Exams">University IT Exams</option>
              <option value="GATE CS">GATE CS</option>
              <option value="Technical Placements">Technical Placements</option>
              <option value="General Skill Check">General Skill Check</option>
              <option value="Certification">Certification</option>
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as QuizVisibility)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            >
              <option value="public">Public (Visible in Explore)</option>
              <option value="private">Private (Only Accessible via Code)</option>
              <option value="unlisted">Unlisted (Accessible via Direct Link)</option>
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Limit (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                {timeLimitMinutes === 0 ? 'Unlimited' : 'Mins'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description &amp; Syllabus Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of topics covered and target examination syllabus..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
            />
          </div>

        </div>
      </div>

      {/* Part 2: Questions Dynamic Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Dynamic Multiple-Choice Questions ({questions.length})
          </h2>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={q.id || qIndex}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            {/* Question Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  {qIndex + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Question {qIndex + 1}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Question Topic Tag (vital for topic evaluation!) */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Topic:
                  </span>
                  <input
                    type="text"
                    value={q.topic}
                    onChange={(e) => handleQuestionTopicChange(qIndex, e.target.value)}
                    placeholder="e.g. Paging or Binary Trees"
                    className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 w-32 sm:w-44 focus:bg-white focus:outline-none focus:border-purple-500"
                    title="Specific sub-topic for accuracy analysis"
                  />
                </div>

                {/* Points */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-medium">Marks:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={q.points || 1}
                    onChange={(e) => handlePointsChange(qIndex, Number(e.target.value))}
                    className="w-12 px-1.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-center text-slate-800"
                  />
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={() => handleDuplicateQuestion(qIndex)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                  title="Duplicate Question"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                  title="Delete Question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Question Statement *
              </label>
              <textarea
                rows={2}
                value={q.text}
                onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                placeholder="Enter clear, unambiguous question text..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Options with Radio Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-600">
                Options &amp; Select Correct Answer (Radio button marks the correct option) *
              </label>

              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctOptionIndex === optIndex;
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        isCorrect
                          ? 'border-purple-400 bg-purple-50/40'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      {/* Radio to mark correct */}
                      <input
                        type="radio"
                        name={`correct-opt-${qIndex}`}
                        checked={isCorrect}
                        onChange={() => handleCorrectOptionSelect(qIndex, optIndex)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        title="Mark this option as correct"
                      />
                      <span className="w-5 font-mono text-xs font-bold text-slate-600">
                        {optionLetters[optIndex]}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optionLetters[optIndex]} text...`}
                        className="grow px-2.5 py-1 text-xs bg-transparent border-0 focus:outline-none text-slate-900"
                      />
                      {isCorrect && (
                        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Educational Explanation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Detailed Educational Explanation (Revealed only after submission)
              </label>
              <textarea
                rows={2}
                value={q.explanation}
                onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                placeholder="Explain the theory, concept, or formula behind why this answer is correct..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-50 border border-dashed border-purple-300 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Question</span>
          </button>
        </div>
      </div>

      {/* Part 3: Sticky / Final Action Bar */}
      <div className="sticky bottom-4 bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold">{questions.length} Questions</span>
          <span>·</span>
          <span>{totalPointsSum} Total Points</span>
          <span>·</span>
          <span className="text-purple-400 capitalize">{visibility} Visibility</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Quiz Now</span>
          </button>
        </div>
      </div>

    </div>
  );
};
