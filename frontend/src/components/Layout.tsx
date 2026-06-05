import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Loader } from './Loader';

export const Layout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect to Auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-darkBg">
      {/* Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        {/* Child Router Content */}
        <div className="flex-1 animate-[fadeIn_0.3s_ease-out]">
          <Outlet />
        </div>

        {/* Unified Footer */}
        <footer className="mt-12 pt-6 border-t border-darkBorder flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} InterviewHub Experience Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Help & Documentation</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Admin Desk</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
