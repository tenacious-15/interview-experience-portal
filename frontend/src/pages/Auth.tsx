import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { Mail, Lock, User as UserIcon, GraduationCap, Building2, KeyRound } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export const Auth: React.FC = () => {
  const { registerUser, verifyEmailToken, loginUser, loginWithGoogle, forgotUserPassword, resetUserPassword, isAuthenticated } = useAuth();
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

    // Attempt to initialize if script is already loaded
    if ((window as any).google) {
      initGoogle();
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initGoogle);
      }
    };
  }, [mode]);

  const renderGoogleButton = () => {
    const g = (window as any).google;
    const btnContainer = document.getElementById('googleSignInButton');
    if (g && g.accounts && btnContainer) {
      g.accounts.id.renderButton(btnContainer, {
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: btnContainer.clientWidth || 320,
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
        
        // Auto-login registered user directly since registration is auto-verified!
        try {
          await loginUser({ email, password });
          navigate('/');
        } catch (loginErr) {
          // If auto-login fails, prompt them to sign in
          setMessage({ 
            type: 'success', 
            text: 'Registration successful! Please sign in using your credentials.' 
          });
          setMode('login');
        }
        setPassword('');
      } else if (mode === 'forgot') {
        const res = await forgotUserPassword(email);
        setMessage({ type: 'success', text: res.message || 'Password reset link printed to server console.' });
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12 bg-slate-950 text-slate-100 font-sans">
      {/* Soft background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 relative z-10 shadow-2xl">
        {/* Toggle sliding container (only for login & register modes) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Trouble logging in?'}
            {mode === 'reset' && 'Reset password'}
            {mode === 'verify' && 'Verifying Email'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {mode === 'login' && 'Sign in to continue to your workspace'}
            {mode === 'register' && 'Join the community and start preparing with college seniors.'}
            {mode === 'forgot' && 'Enter your email to receive a secure password recovery link.'}
            {mode === 'reset' && 'Set a strong, new password for your portal account.'}
            {mode === 'verify' && 'Confirming registration token details...'}
          </p>
        </div>

        {/* Message Alert Panel */}
        {message && (
          <div className={`p-4 rounded-xl border mb-5 text-sm flex flex-col gap-1 ${
            message.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400' 
              : 'bg-rose-950/40 border-rose-800/80 text-rose-400'
          }`}>
            <span className="font-bold">{message.type === 'success' ? 'Success' : 'Error'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Body */}
        {mode !== 'verify' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* REGISTER: Name */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {/* LOGIN / REGISTER / FORGOT: Email */}
            {mode !== 'reset' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {/* REGISTER: Additional fields (styled compactly & generic) */}
            {mode === 'register' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">College Name</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="IIIT Surat"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch / Stream</label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Graduation Year</label>
                    <input
                      type="number"
                      required
                      min={2020}
                      max={2035}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      Company <span className="text-[10px] text-slate-500 uppercase">Optional</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        placeholder="Amazon"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOGIN / REGISTER / RESET: Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-14 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* RESET: Confirm Password */}
            {mode === 'reset' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-14 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2"
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
                <div className="border-t border-slate-800 w-full absolute z-0" />
                <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase relative z-10 font-medium">Or</span>
              </div>
            )}

            {/* Google OAuth Button Container */}
            {(mode === 'login' || mode === 'register') && (
              <div id="googleSignInButton" className="w-full flex justify-center mt-2 z-20 min-h-[40px]" />
            )}

          </form>
        )}

        {/* Footer Navigation link redirects */}
        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          {mode === 'login' && (
            <p className="text-sm text-slate-400">
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
            <p className="text-sm text-slate-400">
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
              className="text-sm text-slate-400 hover:text-slate-300 font-semibold"
            >
              ← Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
