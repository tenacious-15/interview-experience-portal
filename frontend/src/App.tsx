import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ExperienceDetails } from './pages/ExperienceDetails';
import { AddExperience } from './pages/AddExperience';
import { QuestionsBank } from './pages/QuestionsBank';
import { Tips } from './pages/Tips';
import { Profile } from './pages/Profile';
import { AdminPanel } from './pages/AdminPanel';

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null; // Let the layout's loading spinner handle it
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes (Handle email verify and password resets as subpages dynamically) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<Auth />} />
          <Route path="/reset-password" element={<Auth />} />

          {/* Authenticated Dashboard Pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/experiences/:id" element={<ExperienceDetails />} />
            <Route path="/add-experience" element={<AddExperience />} />
            <Route path="/questions" element={<QuestionsBank />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Guarded Admin Moderation route */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
