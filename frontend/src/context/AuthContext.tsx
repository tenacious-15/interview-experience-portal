import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college: string;
  branch: string;
  graduationYear: number;
  currentCompany?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  registerUser: (data: any) => Promise<any>;
  verifyEmailToken: (token: string) => Promise<any>;
  loginUser: (credentials: any) => Promise<any>;
  logoutUser: () => Promise<void>;
  forgotUserPassword: (email: string) => Promise<any>;
  resetUserPassword: (data: any) => Promise<any>;
  loginWithGoogle: (credential: string) => Promise<any>;
  updateUserProfile: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Silent authentication check on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt token refresh
        const res = await api.post('/auth/refresh', {});
        const { accessToken } = res.data;
        setAccessToken(accessToken);

        // Fetch user profile
        const profileRes = await api.get('/users/profile');
        setUser(profileRes.data);
      } catch (err) {
        console.log('No existing active session found.');
        setAccessToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for global auth expiration events
    const handleAuthExpired = () => {
      setAccessToken('');
      setUser(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const registerUser = async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const verifyEmailToken = async (token: string) => {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  };

  const loginUser = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    const { accessToken, user: loggedUser } = res.data;
    setAccessToken(accessToken);
    setUser(loggedUser);
    return res.data;
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      setAccessToken('');
      setUser(null);
    }
  };

  const forgotUserPassword = async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetUserPassword = async (data: any) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  };

  const loginWithGoogle = async (credential: string) => {
    const res = await api.post('/auth/google', { credential });
    const { accessToken, user: loggedUser } = res.data;
    setAccessToken(accessToken);
    setUser(loggedUser);
    return res.data;
  };

  const updateUserProfile = async (data: any) => {
    const res = await api.put('/users/profile', data);
    const { user: updatedUser } = res.data;
    setUser(updatedUser);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        registerUser,
        verifyEmailToken,
        loginUser,
        logoutUser,
        loginWithGoogle,
        forgotUserPassword,
        resetUserPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
