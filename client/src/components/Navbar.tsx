import React from 'react';
import { Layers, MessageSquare, Flag, Sparkles, Target, Settings, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

export type TabType = 'observatory' | 'talk' | 'timeline' | 'insights' | 'goals' | 'connections';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onSignIn,
  onSignOut,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'observatory', label: 'Observatory', icon: <Layers size={16} /> },
    { id: 'talk', label: 'Talk', icon: <MessageSquare size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <Flag size={16} /> },
    { id: 'insights', label: 'Insights', icon: <Sparkles size={16} /> },
    { id: 'goals', label: 'Goals & Focus', icon: <Target size={16} /> },
    { id: 'connections', label: 'Connections', icon: <Settings size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Identity */}
        <div 
          onClick={() => onSelectTab('observatory')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers size={18} />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-tight">
              Life Observatory
            </span>
            <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
              See Gradual Change
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User / Auth controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                <UserIcon size={14} className="text-indigo-400" />
                <span className="max-w-[120px] truncate">{user.displayName || user.email || 'User'}</span>
              </div>
              <button
                onClick={onSignOut}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <LogIn size={14} />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation bar */}
      <nav className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition ${
              currentTab === item.id ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};
