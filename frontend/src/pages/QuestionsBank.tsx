import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { 
  Search, 
  Code, 
  ExternalLink, 
  Building2, 
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

interface QuestionFeedItem {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyName: string;
  experience?: string; // ID of linked experience
  createdAt: string;
  user: {
    name: string;
    college: string;
  };
}

export const QuestionsBank: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [company, setCompany] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          search,
          topic,
          difficulty,
          company,
          page,
          limit: 12
        }
      });
      setQuestions(res.data.questions);
      setTotalPages(res.data.pages);
      setTotalQuestions(res.data.total);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, topic, difficulty, company, page]);

  const handleClearFilters = () => {
    setSearch('');
    setTopic('');
    setDifficulty('');
    setCompany('');
    setPage(1);
  };

  const topicsList = [
    'Arrays', 'Strings', 'Linked List', 'Stacks', 'Queues', 
    'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 
    'Recursion', 'Backtracking', 'Binary Search', 'Sorting',
    'Trie', 'Heaps', 'Bit Manipulation', 'Operating Systems', 
    'DBMS', 'Computer Networks', 'System Design'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          DSA Question Bank
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          A centralized archive of technical coding questions asked in recent interview processes.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        {/* Search */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Questions</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title, description..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl input-premium text-xs"
            />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={company}
              onChange={(e) => { setCompany(e.target.value); setPage(1); }}
              placeholder="e.g. Google"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl input-premium text-xs"
            />
          </div>
        </div>

        {/* Topic dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic</label>
          <select
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl input-premium text-xs bg-darkBg text-slate-200"
          >
            <option value="">All Topics</option>
            {topicsList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Difficulty dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl input-premium text-xs bg-darkBg text-slate-200"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="col-span-1 sm:col-span-2 md:col-span-5 flex justify-between items-center text-xs mt-2 border-t border-darkBorder pt-3">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">
            Total Questions Found: {totalQuestions}
          </span>
          <button
            onClick={handleClearFilters}
            className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
          >
            Clear All Search Criteria
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Code className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-350">No questions found</h3>
          <p className="text-slate-500 text-sm mt-1">Try broadening your filters or keyword query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {questions.map((q) => (
              <div
                key={q._id}
                className="glass-card p-5 rounded-xl border border-darkBorder flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 uppercase">
                      {q.topic}
                    </span>
                    <span className={`uppercase ${
                      q.difficulty === 'Easy' ? 'text-emerald-400' : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-500'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-900 border border-white/5 text-slate-400">
                      {q.companyName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mt-1.5 leading-snug">{q.title}</h3>
                  </div>

                  {/* Description */}
                  {q.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>
                  )}
                </div>

                {/* Actions & Links */}
                <div className="border-t border-darkBorder mt-4 pt-3.5 flex items-center justify-between text-[10px] font-bold">
                  {q.link ? (
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25 transition-all flex items-center gap-1"
                    >
                      Solve Coding
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div />
                  )}

                  {q.experience ? (
                    <Link
                      to={`/experiences/${q.experience}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-indigo-500/20 transition-all flex items-center gap-1"
                    >
                      Read Round details
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-normal">Standalone question</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/40 border border-white/5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/40 border border-white/5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
