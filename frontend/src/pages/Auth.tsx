import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { Mail, Lock, User as UserIcon, GraduationCap, Building2, KeyRound, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export const Auth: React.FC = () => {
  const { 
    registerUser, 
    verifyEmailToken, 
    loginUser, 
    loginWithGoogle, 
    forgotUserPassword, 
    resetUserPassword, 
    isAuthenticated,
    loading: authLoading
  } = useAuth();
  
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
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
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

  // Dynamically load Google Identity Services Script
  useEffect(() => {
    if (authLoading) return; // Wait for initial auth state

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGoogle = () => {
      const g = (window as any).google;
      if (g && g.accounts) {
        g.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1058296316279-h0h85cbrh57qg152k34m829afake.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        renderGoogleButton();
      }
    };

    if (script) {
      script.addEventListener('load', initGoogle);
    }

    if ((window as any).google) {
      initGoogle();
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initGoogle);
      }
    };
  }, [mode, authLoading]);

  const renderGoogleButton = () => {
    const g = (window as any).google;
    const btnContainer = document.getElementById('googleSignInButton');
    if (g && g.accounts && btnContainer) {
      g.accounts.id.renderButton(btnContainer, {
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: btnContainer.clientWidth || 340,
      });
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setMessage(null);
    try {
      await loginWithGoogle(response.credential);
      navigate('/');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Google Sign-In failed.'
      });
    } finally {
      setLoading(false);
    }
  };

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
        await registerUser({
          name,
          email,
          password,
          college,
          branch,
          graduationYear,
          currentCompany
        });
        
        // Auto-login registered user directly
        try {
          await loginUser({ email, password });
          navigate('/');
        } catch (loginErr) {
          setMessage({ 
            type: 'success', 
            text: 'Registration successful! Please sign in using your credentials.' 
          });
          setMode('login');
        }
        setPassword('');
      } else if (mode === 'forgot') {
        const res = await forgotUserPassword(email);
        setMessage({ type: 'success', text: res.message || 'Password reset link sent successfully.' });
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
      console.error(err);
      let errorMsg = 'An unexpected error occurred. Please try again.';
      if (err.message === 'Network Error') {
        errorMsg = 'Could not connect to the server. Please check your internet connection or backend server status.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  // Show a full-screen loader during the silent token verification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12 bg-slate-950 text-slate-100 font-sans">
      {/* Soft background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 shadow-2xl border border-white/10">
        
        {/* Toggle sliding container (only for login & register modes) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 mb-6 relative">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 relative z-10 text-center"
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-800 rounded-lg -z-10 border border-white/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 relative z-10 text-center"
            >
              {mode === 'register' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-slate-800 rounded-lg -z-10 border border-white/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Register</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Trouble logging in?'}
            {mode === 'reset' && 'Reset password'}
            {mode === 'verify' && 'Verifying Email'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {mode === 'login' && 'Sign in to continue to your workspace'}
            {mode === 'register' && 'Join the community and start preparing with college seniors.'}
            {mode === 'forgot' && 'Enter your email to receive a secure password recovery link.'}
            {mode === 'reset' && 'Set a strong, new password for your portal account.'}
            {mode === 'verify' && 'Confirming registration token details...'}
          </p>
        </div>

        {/* Message Alert Panel */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border mb-5 text-xs flex gap-2.5 items-start ${
                message.type === 'success' 
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' 
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-400'
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{message.type === 'success' ? 'Success' : 'Error'}</span>
                <span className="leading-relaxed">{message.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        {mode !== 'verify' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* REGISTER: Name */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* LOGIN / REGISTER / FORGOT: Email */}
            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* REGISTER: Additional fields */}
            {mode === 'register' && (
              <div className="space-y-4 pt-1 animate-[fadeIn_0.2s_ease-out]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">College</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="IIIT Surat"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Branch</label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Grad Year</label>
                    <input
                      type="number"
                      required
                      min={2020}
                      max={2035}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      Company <span className="text-[9px] text-slate-500 font-bold lowercase">optional</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="Amazon"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl input-premium text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOGIN / REGISTER / RESET: Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-14 py-2.5 rounded-xl input-premium text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[10px] text-slate-400 hover:text-white font-bold transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* RESET: Confirm Password */}
            {mode === 'reset' && (
              <div className="space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-14 py-2.5 rounded-xl input-premium text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white btn-premium mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <>
                  {mode === 'login' && 'Sign in'}
                  {mode === 'register' && 'Register'}
                  {mode === 'forgot' && 'Send recovery link'}
                  {mode === 'reset' && 'Update Password'}
                </>
              )}
            </button>

            {/* Or divider (only in login & register) */}
            {(mode === 'login' || mode === 'register') && (
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-white/5 w-full absolute z-0" />
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase relative z-10 font-bold tracking-wider">Or</span>
              </div>
            )}

            {/* Google OAuth Button Container */}
            {(mode === 'login' || mode === 'register') && (
              <div id="googleSignInButton" className="w-full flex justify-center mt-2 z-20 min-h-[44px]" />
            )}

          </form>
        )}

        {/* Footer Navigation redirects */}
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          {mode === 'login' && (
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition"
              >
                Create one
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition"
              >
                Sign in
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-300 font-bold"
            >
              ← Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
