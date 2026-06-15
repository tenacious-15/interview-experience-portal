import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 right-0 left-0 h-16 glass-card border-b border-darkBorder z-30 px-6 flex items-center justify-between md:ml-64 bg-darkBg/80 backdrop-blur-md">
      {/* Left side: Hamburger on mobile */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 focus:outline-none md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-indigo-400/90 tracking-widest uppercase">
            Portal Portal
          </span>
          <h2 className="text-sm font-bold text-slate-300">Welcome Back, {user?.name ? user.name.split(' ')[0] : 'Guest'}!</h2>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Simple Notification bell */}
        <button className="p-2 rounded-lg bg-slate-900/40 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-glow" />
        </button>

        {/* User avatar redirect */}
        <Link 
          to="/profile" 
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/20 overflow-hidden flex items-center justify-center text-indigo-300 font-bold text-xs">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <span className="text-xs font-semibold text-slate-300 hidden md:inline">{user?.name || 'User'}</span>
        </Link>
      </div>
    </header>
  );
};
