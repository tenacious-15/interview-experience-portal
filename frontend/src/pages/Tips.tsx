import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { 
  Lightbulb, 
  ThumbsUp, 
  Plus, 
  Trash, 
  Filter, 
  X
} from 'lucide-react';

interface TipFeedItem {
  _id: string;
  title: string;
  content: string;
  category: string;
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

export const Tips: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [tips, setTips] = useState<TipFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Create Tip Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Coding');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tips', {
        params: { category: selectedCategory }
      });
      setTips(res.data);
    } catch (err) {
      console.error('Error fetching tips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [selectedCategory]);

  const handleVote = async (tipId: string) => {
    if (!user) return;
    try {
      const res = await api.post(`/tips/${tipId}/vote`);
      setTips(prev => prev.map(t => {
        if (t._id === tipId) {
          return { ...t, upvotes: res.data.upvotes };
        }
        return t;
      }));
    } catch (err) {
      console.error('Error voting tip:', err);
    }
  };

  const handleDelete = async (tipId: string) => {
    if (!window.confirm('Are you sure you want to delete this prep tip?')) return;
    try {
      await api.delete(`/tips/${tipId}`);
      setTips(prev => prev.filter(t => t._id !== tipId));
    } catch (err) {
      console.error('Error deleting tip:', err);
    }
  };

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newTitle || !newContent || !newCategory) {
      setError('All fields are required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post('/tips', {
        title: newTitle,
        content: newContent,
        category: newCategory
      });
      
      setTips(prev => [res.data.tip, ...prev]);
      
      // Reset
      setNewTitle('');
      setNewContent('');
      setNewCategory('Coding');
      setModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit tip.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const categories = ['Coding', 'System Design', 'Resume', 'Aptitude', 'HR / Behavioral', 'Internships'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-indigo-400" />
            Preparation Tips
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            General preparation strategies, study resources, and interview strategies shared by seniors.
          </p>
        </div>
        
        {user && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white btn-premium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Share Advice
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            selectedCategory === ''
              ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
              : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : tips.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-350">No tips shared in this category</h3>
          <p className="text-slate-500 text-sm mt-1">Be the first to share preparation advice for this topic!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {tips.map((t) => {
            const hasUpvoted = user && t.upvotes.includes(user.id);
            const isOwner = user && t.user._id === user.id;
            const canDelete = isOwner || isAdmin;

            return (
              <div 
                key={t._id} 
                className="glass-card p-6 rounded-xl border border-darkBorder flex flex-col justify-between hover:border-indigo-500/15 transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* User Profile Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-indigo-950 text-indigo-350 font-bold flex items-center justify-center border border-indigo-500/20 overflow-hidden text-sm">
                        {t.user?.avatar ? (
                          <img src={t.user.avatar} alt={t.user.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          t.user?.name ? t.user.name.charAt(0).toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">{t.user?.name || 'Anonymous'}</h4>
                        <span className="text-[9px] text-slate-500 block">
                          {t.user?.college ? t.user.college.split(',')[0] : 'N/A'} • Class of {t.user?.graduationYear || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase">
                        {t.category}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-250 leading-snug">{t.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-2 whitespace-pre-wrap">
                      {t.content}
                    </p>
                  </div>
                </div>

                {/* Footer: Upvote actions */}
                <div className="border-t border-darkBorder mt-4 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleVote(t._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      hasUpvoted
                        ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasUpvoted ? 'fill-indigo-350 text-indigo-300' : ''}`} />
                    <span>Helpful ({t.upvotes.length})</span>
                  </button>

                  <span className="text-[9px] text-slate-500 font-semibold uppercase">
                    Shared {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TIP MODAL DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 rounded-2xl border border-white/10 relative animate-[fadeIn_0.2s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-200 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              Share Preparation Advice
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Help juniors understand timelines, coding platforms, recommended channels, resume tricks, or interview behavioral tactics.
            </p>

            {error && (
              <div className="p-3 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-450 text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitTip} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-350 uppercase">Tip Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best YouTube playlists for System Design"
                  className="w-full px-3.5 py-2 rounded-xl input-premium text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-350 uppercase">Category Tag</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl input-premium text-xs bg-darkBg text-slate-200"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-355 uppercase">Detailed Content</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Summarize your advice. Add links or step-by-step strategies..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl input-premium text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white btn-premium flex items-center justify-center disabled:opacity-50"
                >
                  {submitLoading ? <Loader size="sm" /> : 'Post Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
