import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Lightbulb, 
  PlusSquare, 
  User, 
  ShieldAlert, 
  LogOut,
  Terminal
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, isAdmin, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Questions Bank', path: '/questions', icon: BookOpen },
    { name: 'Prep Tips', path: '/tips', icon: Lightbulb },
    { name: 'Add Experience', path: '/add-experience', icon: PlusSquare },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 glass-card border-r border-darkBorder z-50 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo / Header */}
          <div className="p-6 flex items-center gap-3 border-b border-darkBorder">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                InterviewHub
              </h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Experience Portal
              </span>
            </div>
          </div>

          {/* User Preview */}
          {user && (
            <div className="p-4 mx-4 mt-6 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-900/50 border border-indigo-500/30 overflow-hidden flex items-center justify-center text-indigo-300 font-bold text-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-indigo-400 capitalize truncate font-medium">{user.role}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-4 mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 text-indigo-300 border-l-4 border-indigo-500 shadow-md shadow-indigo-500/5' 
                      : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-darkBorder">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400/90 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
