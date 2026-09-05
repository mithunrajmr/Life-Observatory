import React, { useState } from 'react';
import { Search, LogOut, LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onQuickAsk?: (question: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

const greetingFor = (hour: number): string => {
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Winding down';
};

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignIn,
  onSignOut,
  onQuickAsk,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayName = user?.displayName || 'Alex';
  const firstName = displayName.split(' ')[0] || 'Alex';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !onQuickAsk) return;
    onQuickAsk(query.trim());
    setQuery('');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F7F6F2]/85 backdrop-blur-md border-b border-[#DDE2DD] px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
      {/* Left: mobile toggle + quick ask */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-lg text-[#1D2421] hover:bg-[#F1F2EE] transition"
            aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {user && (
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[340px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A938E] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your companion…"
              aria-label="Ask your companion a question"
              className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#DDE2DD] rounded-full text-[13px] text-[#1D2421] placeholder:text-[#8A938E] focus:border-[#355C4A]"
            />
          </form>
        )}
      </div>

      {/* Right: greeting + profile */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <>
            <div className="hidden md:flex flex-col text-right leading-tight">
              <span className="text-[13px] font-semibold text-[#1D2421]">
                {greeting}, {firstName}
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#8A938E] mt-0.5">
                {dateLabel}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#C4CCC3] transition"
                aria-label="Account menu"
                aria-expanded={showDropdown}
              >
                <div className="w-7 h-7 rounded-full bg-[#355C4A] text-[#FFFFFF] flex items-center justify-center font-heading font-semibold text-xs">
                  {firstName[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} className={`text-[#8A938E] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#DDE2DD] rounded-xl shadow-elevated py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-[#DDE2DD]/60">
                      <p className="text-[13px] font-semibold text-[#1D2421] truncate">{displayName}</p>
                      <p className="text-[11px] text-[#8A938E] truncate">{user.email || 'Exploring the demo journey'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#A95C58] hover:bg-[#F9EFEF] flex items-center gap-2 transition"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <button onClick={onSignIn} className="btn-primary text-xs py-2 px-4">
            <LogIn size={14} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
