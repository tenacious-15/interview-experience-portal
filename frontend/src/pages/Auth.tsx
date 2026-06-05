import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { ShieldCheck, Mail, Lock, User as UserIcon, GraduationCap, Building2, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export const Auth: React.FC = () => {
  const { registerUser, verifyEmailToken, loginUser, forgotUserPassword, resetUserPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');



  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Read verification or reset tokens from URL
  useEffect(() => {
    const verifyToken = searchParams.get('token');
    const path = window.location.pathname;

    if (verifyToken && path.includes('verify-email')) {
      setMode('verify');
      handleVerifyToken(verifyToken);
    } else if (verifyToken && path.includes('reset-password')) {
      setMode('reset');
    }
  }, [searchParams]);

  const handleVerifyToken = async (token: string) => {
    setLoading(true);
    try {
      await verifyEmailToken(token);
      setMessage({ type: 'success', text: 'Email verified successfully! You can now log in.' });
      setMode('login');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser({ email, password });
        navigate('/');
      } else if (mode === 'register') {
        const res = await registerUser({
          name,
          email,
          password,
          college,
          branch,
          graduationYear,
          currentCompany
        });
        
        setMessage({ 
          type: 'success', 
          text: res.message || 'Registration successful! Verification token sent.' 
        });

        // Clean fields
        setPassword('');
      } else if (mode === 'forgot') {
        const res = await forgotUserPassword(email);
        setMessage({ type: 'success', text: res.message || 'Reset link dispatched.' });
      } else if (mode === 'reset') {
        const token = searchParams.get('token');
        if (!token) throw new Error('Reset token is missing from URL.');

        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match.' });
          setLoading(false);
          return;
        }

        await resetUserPassword({ token, password });
        setMessage({ type: 'success', text: 'Password reset successful! Please log in.' });
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'An error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl glass-card rounded-2xl p-8 relative z-10 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            {mode === 'login' && 'Welcome to InterviewHub'}
            {mode === 'register' && 'Create Your Student Account'}
            {mode === 'forgot' && 'Trouble Logging In?'}
            {mode === 'reset' && 'Reset Password'}
            {mode === 'verify' && 'Verifying Email'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {mode === 'login' && 'Access company interview experiences, tips, and asked questions.'}
            {mode === 'register' && 'Join the community and start preparing with college seniors.'}
            {mode === 'forgot' && 'Enter your email to receive a secure password recovery link.'}
            {mode === 'reset' && 'Set a strong, new password for your portal account.'}
            {mode === 'verify' && 'Confirming registration token details...'}
          </p>
        </div>

        {/* Info/Error Message Display */}
        {message && (
          <div className={`p-4 rounded-xl border mb-6 text-sm flex flex-col gap-1 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <span className="font-semibold">{message.type === 'success' ? 'Success' : 'Error'}</span>
            <span>{message.text}</span>
          </div>
        )}



        {/* Form Container */}
        {mode !== 'verify' && (
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {/* REGISTER: Name */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium"
                  />
                </div>
              </div>
            )}

            {/* REGISTER / LOGIN / FORGOT: Email */}
            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium"
                  />
                </div>
              </div>
            )}

            {/* REGISTER: Academic Info Grid */}
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">College Name</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Delhi"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch / Stream</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 rounded-xl input-premium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Graduation Year</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2035}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-4 py-2.5 rounded-xl input-premium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Current Company <span className="text-slate-500">(Optional)</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Amazon"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOGIN / REGISTER / RESET: Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium"
                  />
                </div>
              </div>
            )}

            {/* RESET: Confirm Password */}
            {mode === 'reset' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white btn-premium flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Register'}
                  {mode === 'forgot' && 'Send recovery link'}
                  {mode === 'reset' && 'Update Password'}
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to login toggle */}
        <div className="mt-8 text-center border-t border-darkBorder pt-6">
          {mode === 'login' && (
            <p className="text-sm text-slate-400">
              New to the platform?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
              >
                Sign Up Now
              </button>
            </p>
          )}

          {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <button
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className="text-sm text-slate-400 hover:text-slate-300 font-medium flex items-center gap-2 justify-center mx-auto"
            >
              ← Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
