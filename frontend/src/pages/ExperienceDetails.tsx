import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { 
  ThumbsUp, 
  MessageSquare, 
  CornerDownRight, 
  Send, 
  Trash, 
  Building2, 
  Calendar, 
  Code,
  GraduationCap,
  ExternalLink,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';

interface Question {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface ExperienceDetail {
  _id: string;
  companyName: string;
  role: string;
  interviewDate: string;
  status: 'Selected' | 'Rejected' | 'Waiting';
  oaExperience?: string;
  technicalRoundExperience?: string;
  hrRoundExperience?: string;
  overallExperience: string;
  preparationTips?: string;
  upvotes: string[];
  createdAt: string;
  user: {
    _id: string;
    name: string;
    college: string;
    branch: string;
    graduationYear: number;
    currentCompany?: string;
    avatar?: string;
  };
}

interface CommentThread {
  _id: string;
  text: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    college: string;
    branch: string;
    avatar?: string;
  };
  replies: CommentThread[];
}

export const ExperienceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);

  // Input states
  const [newCommentText, setNewCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchData = async () => {
    try {
      const expRes = await api.get(`/experiences/${id}`);
      setExperience(expRes.data.experience);
      setQuestions(expRes.data.questions);

      const commRes = await api.get(`/experiences/${id}/comments`);
      setComments(commRes.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleVote = async () => {
    if (!user || !experience) return;
    try {
      const res = await api.post(`/experiences/${experience._id}/vote`);
      setExperience(prev => prev ? { ...prev, upvotes: res.data.upvotes } : null);
    } catch (err) {
      console.error('Error voting experience:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? replyText : newCommentText;
    if (!text.trim() || !id) return;

    setCommentLoading(true);
    try {
      await api.post(`/experiences/${id}/comments`, {
        text,
        parentCommentId: parentId
      });

      // Reset values
      if (parentId) {
        setReplyText('');
        setActiveReplyId(null);
      } else {
        setNewCommentText('');
      }

      // Re-fetch comments
      const commRes = await api.get(`/experiences/${id}/comments`);
      setComments(commRes.data);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      // Refresh
      const commRes = await api.get(`/experiences/${id}/comments`);
      setComments(commRes.data);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleDeleteExperience = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this experience post?')) return;
    try {
      await api.delete(`/experiences/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting experience:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center max-w-xl mx-auto border border-white/5">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Experience not found</h3>
        <p className="text-slate-400 text-sm mt-1">This post may have been removed by the moderator or creator.</p>
        <Link to="/" className="inline-block mt-4 text-xs font-bold text-indigo-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user && experience.user._id === user.id;
  const showDeleteBtn = isOwner || isAdmin;
  const hasUpvoted = user && experience.upvotes.includes(user.id);

  // Render a comment node recursively
  const renderComment = (comment: CommentThread, depth = 0) => {
    const isCommentOwner = user && comment.user._id === user.id;
    const canDeleteComment = isCommentOwner || isAdmin;

    return (
      <div 
        key={comment._id} 
        style={{ marginLeft: `${Math.min(depth * 24, 96)}px` }}
        className={`p-4 rounded-xl border border-white/5 bg-slate-900/10 space-y-2 mt-3 ${depth > 0 ? 'border-l-2 border-l-indigo-500/20' : ''}`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/20 overflow-hidden text-xs">
              {comment.user.avatar ? (
                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
              ) : (
                comment.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">{comment.user.name}</span>
              <span className="text-[9px] text-slate-500 block">
                {comment.user.college.split(',')[0]} • {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {canDeleteComment && (
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-slate-355 text-xs pl-1 leading-relaxed">{comment.text}</p>

        {/* Reply Trigger & Input */}
        <div className="pl-1 pt-1 flex flex-col gap-2">
          {user && activeReplyId !== comment._id && (
            <button
              onClick={() => {
                setActiveReplyId(comment._id);
                setReplyText('');
              }}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 w-max"
            >
              <CornerDownRight className="w-3 h-3" />
              Reply
            </button>
          )}

          {activeReplyId === comment._id && (
            <form onSubmit={(e) => handleAddComment(e, comment._id)} className="flex gap-2 items-center mt-2">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user.name.split(' ')[0]}...`}
                className="flex-1 px-3 py-1.5 rounded-lg input-premium text-xs"
              />
              <button
                type="submit"
                disabled={commentLoading}
                className="p-2 rounded-lg btn-premium text-white flex-shrink-0"
              >
                <Send className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setActiveReplyId(null)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-400 px-1"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Recursively render replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back to Home Navigation */}
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to feed
        </Link>
        {showDeleteBtn && (
          <button
            onClick={handleDeleteExperience}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 transition-all duration-200"
          >
            Delete Post
          </button>
        )}
      </div>

      {/* Main Experience Layout */}
      <article className="glass-card p-6 md:p-8 rounded-2xl border border-darkBorder space-y-6">
        {/* User Card Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-darkBorder pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold flex items-center justify-center border border-indigo-500/20 overflow-hidden text-lg">
              {experience.user?.avatar ? (
                <img src={experience.user.avatar} alt={experience.user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                experience.user?.name ? experience.user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-100">{experience.user?.name || 'Anonymous'}</h1>
              <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{experience.user?.college || 'N/A'}</span>
                <span>•</span>
                <span>{experience.user?.branch || 'N/A'} (Class of {experience.user?.graduationYear || 'N/A'})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 text-xs font-extrabold rounded-lg uppercase tracking-wider ${
              experience.status === 'Selected' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : experience.status === 'Rejected' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {experience.status}
            </span>
          </div>
        </div>

        {/* Company and Role Details */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 rounded-xl bg-slate-900/30 border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 uppercase tracking-wider font-bold">Company:</span>
            <span className="font-extrabold text-slate-200">{experience.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 uppercase tracking-wider font-bold">Designation:</span>
            <span className="font-bold text-indigo-300">{experience.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 uppercase tracking-wider font-bold">Interview Date:</span>
            <span className="font-semibold text-slate-350">{new Date(experience.interviewDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Rounds Breakdown */}
        <div className="space-y-6">
          {experience.oaExperience && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-l-4 border-indigo-500 pl-3">
                Online Assessment (OA) Round
              </h3>
              <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-wrap pl-4 bg-slate-900/10 p-3 rounded-lg border border-white/5">
                {experience.oaExperience}
              </p>
            </div>
          )}

          {experience.technicalRoundExperience && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-l-4 border-indigo-500 pl-3">
                Technical Rounds Experience
              </h3>
              <p className="text-slate-355 text-xs leading-relaxed whitespace-pre-wrap pl-4 bg-slate-900/10 p-3 rounded-lg border border-white/5">
                {experience.technicalRoundExperience}
              </p>
            </div>
          )}

          {experience.hrRoundExperience && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-l-4 border-indigo-500 pl-3">
                HR / Behavioral Round
              </h3>
              <p className="text-slate-355 text-xs leading-relaxed whitespace-pre-wrap pl-4 bg-slate-900/10 p-3 rounded-lg border border-white/5">
                {experience.hrRoundExperience}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-l-4 border-indigo-500 pl-3">
              Overall Experience & Summary
            </h3>
            <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-wrap pl-4 bg-slate-900/10 p-3 rounded-lg border border-white/5">
              {experience.overallExperience}
            </p>
          </div>

          {experience.preparationTips && (
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider border-l-4 border-emerald-500 pl-3">
                Preparation Strategy & Tips
              </h3>
              <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-wrap pl-4 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                {experience.preparationTips}
              </p>
            </div>
          )}
        </div>

        {/* Coding Questions Section */}
        {questions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-darkBorder">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-cyan-400" />
              DSA Questions Asked in rounds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions.map((q) => (
                <div key={q._id} className="p-4 rounded-xl border border-white/5 bg-slate-900/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider bg-slate-800 text-slate-400">
                      {q.topic}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${
                      q.difficulty === 'Easy' ? 'text-emerald-400' : q.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-500'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs mt-1">{q.title}</h4>
                  {q.description && <p className="text-[10px] text-slate-500">{q.description}</p>}
                  
                  {q.link && (
                    <a 
                      href={q.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline pt-1"
                    >
                      Solve Question
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upvote triggers */}
        <div className="flex items-center justify-between border-t border-darkBorder pt-6 mt-6">
          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
              hasUpvoted
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-indigo-350 text-indigo-300' : ''}`} />
            <span>Helpful Post ({experience.upvotes.length})</span>
          </button>

          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Posted {new Date(experience.createdAt).toLocaleDateString()}
          </span>
        </div>
      </article>

      {/* Discussion Threads */}
      <section className="glass-card p-6 md:p-8 rounded-2xl border border-darkBorder space-y-6">
        <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2 border-b border-darkBorder pb-4">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Community Discussion ({comments.length})
        </h3>

        {/* Root Comment Form */}
        {user ? (
          <form onSubmit={(e) => handleAddComment(e, null)} className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded bg-indigo-950 text-indigo-350 border border-indigo-500/20 font-bold flex items-center justify-center flex-shrink-0 text-sm">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-grow space-y-2">
              <textarea
                required
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your feedback, congratulations or questions about this interview..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-xs"
              />
              <button
                type="submit"
                disabled={commentLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-premium flex items-center gap-1.5 ml-auto"
              >
                {commentLoading ? <Loader size="sm" /> : <>Comment <Send className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5 text-center text-xs text-slate-500">
            Please log in to participate in discussion threads.
          </div>
        )}

        {/* Comments Feed */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No comments shared yet. Be the first to start the discussion!
            </div>
          ) : (
            comments.map(c => renderComment(c, 0))
          )}
        </div>
      </section>
    </div>
  );
};
