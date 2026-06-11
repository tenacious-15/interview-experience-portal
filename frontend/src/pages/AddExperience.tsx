import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader } from '../components/Loader';
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash, 
  Info,
  CheckCircle,
  HelpCircle,
  Code
} from 'lucide-react';

interface QuestionInput {
  title: string;
  description: string;
  link: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const AddExperience: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load draft field
  const getDraftField = (field: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem('interview_experience_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[field] !== undefined) {
          return parsed[field];
        }
      }
    } catch (e) {
      console.error('Error loading draft field:', e);
    }
    return defaultValue;
  };

  // Form States
  const [companyName, setCompanyName] = useState(() => getDraftField('companyName', ''));
  const [role, setRole] = useState(() => getDraftField('role', ''));
  const [interviewDate, setInterviewDate] = useState(() => getDraftField('interviewDate', ''));
  const [status, setStatus] = useState<'Selected' | 'Rejected' | 'Waiting'>(() => getDraftField('status', 'Selected'));
  
  const [oaExperience, setOaExperience] = useState(() => getDraftField('oaExperience', ''));
  const [technicalRoundExperience, setTechnicalRoundExperience] = useState(() => getDraftField('technicalRoundExperience', ''));
  const [hrRoundExperience, setHrRoundExperience] = useState(() => getDraftField('hrRoundExperience', ''));
  const [overallExperience, setOverallExperience] = useState(() => getDraftField('overallExperience', ''));
  const [preparationTips, setPreparationTips] = useState(() => getDraftField('preparationTips', ''));

  // Asked Questions State
  const [questions, setQuestions] = useState<QuestionInput[]>(() => 
    getDraftField('questions', [{ title: '', description: '', link: '', topic: 'Arrays', difficulty: 'Medium' }])
  );

  // Show draft restored banner if meaningful draft content was loaded
  const [showRestoredBanner, setShowRestoredBanner] = useState(() => {
    const saved = localStorage.getItem('interview_experience_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!(
          parsed.companyName || 
          parsed.role || 
          parsed.oaExperience || 
          parsed.technicalRoundExperience || 
          parsed.hrRoundExperience || 
          parsed.overallExperience || 
          parsed.preparationTips || 
          (parsed.questions && parsed.questions.some((q: any) => q.title))
        );
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Auto-save draft on changes
  useEffect(() => {
    const draftData = {
      companyName,
      role,
      interviewDate,
      status,
      oaExperience,
      technicalRoundExperience,
      hrRoundExperience,
      overallExperience,
      preparationTips,
      questions
    };
    localStorage.setItem('interview_experience_draft', JSON.stringify(draftData));
  }, [
    companyName,
    role,
    interviewDate,
    status,
    oaExperience,
    technicalRoundExperience,
    hrRoundExperience,
    overallExperience,
    preparationTips,
    questions
  ]);

  const handleClearDraft = () => {
    localStorage.removeItem('interview_experience_draft');
    setCompanyName('');
    setRole('');
    setInterviewDate('');
    setStatus('Selected');
    setOaExperience('');
    setTechnicalRoundExperience('');
    setHrRoundExperience('');
    setOverallExperience('');
    setPreparationTips('');
    setQuestions([{ title: '', description: '', link: '', topic: 'Arrays', difficulty: 'Medium' }]);
    setStep(1);
    setShowRestoredBanner(false);
    setError(null);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { title: '', description: '', link: '', topic: 'Arrays', difficulty: 'Medium' }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionInput, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!companyName || !role || !interviewDate || !status) {
        setError('Please fill in all general details.');
        return false;
      }
    } else if (step === 2) {
      if (!overallExperience) {
        setError('Overall experience details are required.');
        return false;
      }
    } else if (step === 3) {
      // Validate coding links if entered
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.title && q.link) {
          const l = q.link.toLowerCase();
          const isLC = l.includes('leetcode.com');
          const isGFG = l.includes('geeksforgeeks.org');
          const isCF = l.includes('codeforces.com');
          if (!isLC && !isGFG && !isCF) {
            setError(`Question ${i + 1} has an invalid coding link. It must be LeetCode, GeeksforGeeks, or Codeforces.`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    
    // Filter out empty questions
    const validQuestions = questions.filter(q => q.title.trim() !== '');

    try {
      await api.post('/experiences', {
        companyName,
        role,
        interviewDate,
        status,
        oaExperience,
        technicalRoundExperience,
        hrRoundExperience,
        overallExperience,
        preparationTips,
        questions: validQuestions
      });

      // Clear draft on successful submission
      localStorage.removeItem('interview_experience_draft');

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit experience.');
    } finally {
      setLoading(false);
    }
  };

  const topicsList = [
    'Arrays', 'Strings', 'Linked List', 'Stacks', 'Queues', 
    'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 
    'Recursion', 'Backtracking', 'Binary Search', 'Sorting',
    'Trie', 'Heaps', 'Bit Manipulation', 'Operating Systems', 
    'DBMS', 'Computer Networks', 'System Design', 'HR / Behavioral'
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Share Interview Experience</h1>
        <p className="text-xs text-slate-400 mt-1">Help juniors prepare by detailing your recruitment process.</p>
      </div>

      {/* Restored Draft Banner */}
      {showRestoredBanner && (
        <div className="p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-base">📝</span>
            <div>
              <p className="font-bold">Draft restored automatically</p>
              <p className="text-[10px] text-slate-400 mt-0.5">We found an unsaved draft from your last session and restored it.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowRestoredBanner(false)}
              className="px-3 py-1.5 rounded-lg font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Keep Editing
            </button>
            <button
              onClick={handleClearDraft}
              className="px-3 py-1.5 rounded-lg font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all"
            >
              Clear Draft
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicators */}
      <div className="glass-card p-4 rounded-xl flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
          <span className={step >= 1 ? 'text-indigo-400' : 'text-slate-500'}>General Info</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-800 flex-1 mx-2" />
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
          <span className={step >= 2 ? 'text-indigo-400' : 'text-slate-500'}>Round Details</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-800 flex-1 mx-2" />
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
          <span className={step >= 3 ? 'text-indigo-400' : 'text-slate-500'}>Asked Questions</span>
        </div>
        <div className="h-0.5 w-8 bg-slate-800 flex-1 mx-2" />
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>4</span>
          <span className={step >= 4 ? 'text-indigo-400' : 'text-slate-500'}>Review</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: GENERAL INFO */}
      {step === 1 && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200 border-b border-darkBorder pb-3 flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-indigo-400" />
            General Interview Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Microsoft"
                className="w-full px-4 py-2.5 rounded-xl input-premium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Job Role / Designation</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer-1, Intern"
                className="w-full px-4 py-2.5 rounded-xl input-premium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Interview Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Result / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl input-premium bg-darkBg text-slate-200"
              >
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Waiting">Waiting / Still in Process</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ROUND DETAILS */}
      {step === 2 && (
        <div className="glass-card p-6 rounded-2xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <h3 className="text-base font-bold text-slate-200 border-b border-darkBorder pb-3 flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
            Interview Rounds & Journey
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Online Assessment (OA) Round <span className="text-slate-500">(Optional)</span></label>
              <textarea
                value={oaExperience}
                onChange={(e) => setOaExperience(e.target.value)}
                placeholder="Detail the platform, timing, difficulty level, and topics of the coding test..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Technical Rounds (Coding / System Design) <span className="text-slate-500">(Optional)</span></label>
              <textarea
                value={technicalRoundExperience}
                onChange={(e) => setTechnicalRoundExperience(e.target.value)}
                placeholder="Describe coding rounds, whiteboarding, questions asked, and interviewer interaction..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">HR / Behavioral / Fitment Round <span className="text-slate-500">(Optional)</span></label>
              <textarea
                value={hrRoundExperience}
                onChange={(e) => setHrRoundExperience(e.target.value)}
                placeholder="Mention situational questions, company values check, and negotiation topics..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Overall Experience & Vibe <span className="text-rose-400">*</span></label>
              <textarea
                required
                value={overallExperience}
                onChange={(e) => setOverallExperience(e.target.value)}
                placeholder="Summarize the overall experience (e.g. supportiveness, speed of feedback, complexity)..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Preparation Strategy & Tips <span className="text-slate-500">(Optional)</span></label>
              <textarea
                value={preparationTips}
                onChange={(e) => setPreparationTips(e.target.value)}
                placeholder="What resources, topics, or practices would you recommend to juniors preparing for this role?"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl input-premium text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ASKED QUESTIONS */}
      {step === 3 && (
        <div className="glass-card p-6 rounded-2xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center border-b border-darkBorder pb-3">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-cyan-400" />
              Coding & DSA Questions Asked
            </h3>
            <button
              onClick={handleAddQuestion}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </button>
          </div>

          <div className="space-y-5">
            {questions.map((q, index) => (
              <div key={index} className="p-4 rounded-xl border border-white/5 bg-slate-900/20 space-y-3 relative">
                {questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}

                <h4 className="text-xs font-extrabold text-indigo-400">Question #{index + 1}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Question Title</label>
                    <input
                      type="text"
                      required
                      value={q.title}
                      onChange={(e) => handleQuestionChange(index, 'title', e.target.value)}
                      placeholder="e.g. Merge K Sorted Lists"
                      className="w-full px-3 py-2 rounded-lg input-premium text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Topic / Tag</label>
                    <select
                      value={q.topic}
                      onChange={(e) => handleQuestionChange(index, 'topic', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg input-premium text-xs bg-darkBg text-slate-200"
                    >
                      {topicsList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Difficulty</label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg input-premium text-xs bg-darkBg text-slate-200"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">LeetCode/GFG/CF Link <span className="text-slate-500">(Optional)</span></label>
                    <input
                      type="url"
                      value={q.link}
                      onChange={(e) => handleQuestionChange(index, 'link', e.target.value)}
                      placeholder="https://leetcode.com/..."
                      className="w-full px-3 py-2 rounded-lg input-premium text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Brief Description <span className="text-slate-500">(Optional)</span></label>
                    <input
                      type="text"
                      value={q.description}
                      onChange={(e) => handleQuestionChange(index, 'description', e.target.value)}
                      placeholder="Describe constraints or modifications introduced by the interviewer..."
                      className="w-full px-3 py-2 rounded-lg input-premium text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="glass-card p-6 rounded-2xl space-y-5 animate-[fadeIn_0.2s_ease-out]">
          <h3 className="text-base font-bold text-slate-200 border-b border-darkBorder pb-3 flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-indigo-400" />
            Review Your Submission
          </h3>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Company</span>
                <p className="font-bold text-slate-200">{companyName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Role</span>
                <p className="font-bold text-indigo-300">{role}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Interview Date</span>
                <p className="font-semibold text-slate-300">{interviewDate}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <p className="font-bold text-emerald-400">{status}</p>
              </div>
            </div>

            {overallExperience && (
              <div>
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-1">Overall experience summary</h4>
                <p className="p-3 rounded-xl bg-slate-900/20 border border-white/5 text-slate-400 text-xs whitespace-pre-wrap leading-relaxed">{overallExperience}</p>
              </div>
            )}

            {questions.filter(q => q.title).length > 0 && (
              <div>
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">DSA Questions Attached</h4>
                <div className="flex flex-wrap gap-2">
                  {questions.filter(q => q.title).map((q, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-slate-300 text-xs flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      {q.title} ({q.difficulty})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Button Controls */}
      <div className="flex justify-between items-center pt-2">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white btn-premium flex items-center gap-1.5"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white btn-premium flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <Loader size="sm" />
            ) : (
              <>
                Submit Experience
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
