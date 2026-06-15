import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { 
  Search, 
  SlidersHorizontal, 
  ThumbsUp, 
  ArrowRight,
  TrendingUp,
  FileText,
  HelpCircle,
  Building2,
  Calendar
} from 'lucide-react';

interface ExperienceFeedItem {
  _id: string;
  companyName: string;
  role: string;
  interviewDate: string;
  status: 'Selected' | 'Rejected' | 'Waiting';
  overallExperience: string;
  upvotes: string[];
  createdAt: string;
  user: {
    _id: string;
    name: string;
    college: string;
    branch: string;
    graduationYear: number;
    avatar?: string;
  };
}

interface AnalyticsStats {
  totalExperiences: number;
  totalQuestions: number;
  topCompanies: { name: string; count: number }[];
  topTopics: { name: string; count: number }[];
  trendingCompanies: string[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<ExperienceFeedItem[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load feed and stats
  const fetchFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await api.get('/experiences', {
        params: {
          search,
          company,
          role,
          status,
          year,
          page,
          limit: 6
        }
      });
      setExperiences(res.data.experiences);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching experiences feed:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [search, company, role, status, year, page]);

  const handleVote = async (e: React.MouseEvent, expId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      const res = await api.post(`/experiences/${expId}/vote`);
      // Update local state
      setExperiences(prev => prev.map(exp => {
        if (exp._id === expId) {
          return { ...exp, upvotes: res.data.upvotes };
        }
        return exp;
      }));
    } catch (err) {
      console.error('Error upvoting experience:', err);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompany('');
    setRole('');
    setStatus('');
    setYear('');
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Interview Feed
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse genuine interview experiences shared by seniors and peers.
          </p>
        </div>
        <Link 
          to="/add-experience"
          className="px-5 py-3 rounded-xl text-sm font-semibold text-white btn-premium flex items-center gap-2"
        >
          Share Your Experience
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Analytics Summary Widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Experiences</span>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">{stats.totalExperiences}</h3>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">DSA Questions</span>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">{stats.totalQuestions}</h3>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Top Recruiters</span>
              <h3 className="text-2xl font-bold text-slate-200 mt-0.5">{stats.topCompanies.length} Active</h3>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Trending</span>
              <div className="flex gap-1.5 mt-1">
                {stats.trendingCompanies.map(tc => (
                  <span key={tc} className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {tc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Container */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, company name, or role..."
              className="w-full pl-12 pr-4 py-3 rounded-xl input-premium"
            />
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 ${
              showFilters 
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' 
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-darkBorder animate-[fadeIn_0.2s_ease-out]">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Job Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE Intern"
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Interview Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm bg-darkBg text-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Waiting">Waiting</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Graduation Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2026"
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline"
              >
                Reset Filter Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feed Area */}
      {feedLoading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No experiences matching criteria</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Try adjusting your search terms, changing statuses, or clearing filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
          >
            Clear All Search Queries
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((exp) => {
              const hasUpvoted = user && exp.upvotes.includes(user.id);
              return (
                <Link
                  key={exp._id}
                  to={`/experiences/${exp._id}`}
                  className="glass-card p-6 rounded-2xl glass-card-hover block border border-darkBorder"
                >
                  {/* Card Header: User Profiling */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-950 text-indigo-300 font-extrabold flex items-center justify-center border border-indigo-500/20 overflow-hidden text-sm">
                        {exp.user?.avatar ? (
                          <img src={exp.user.avatar} alt={exp.user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          exp.user?.name ? exp.user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{exp.user?.name || 'Anonymous'}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {exp.user?.college ? exp.user.college.split(',')[0] : 'N/A'} • Class of {exp.user?.graduationYear || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                      exp.status === 'Selected' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : exp.status === 'Rejected' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {exp.status}
                    </span>
                  </div>

                  {/* Company & Role Details */}
                  <div className="mt-5">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {exp.companyName}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-200 mt-2 hover:text-indigo-300 transition-colors">
                      {exp.role}
                    </h3>
                  </div>

                  {/* Summary of Overall experience */}
                  <p className="text-slate-400 text-xs mt-3 line-clamp-3 leading-relaxed">
                    {exp.overallExperience}
                  </p>

                  {/* Card Actions: Upvote & Comments */}
                  <div className="flex items-center justify-between border-t border-darkBorder mt-5 pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleVote(e, exp._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          hasUpvoted
                            ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/5'
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-indigo-300' : ''}`} />
                        <span>{exp.upvotes.length}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(exp.interviewDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
