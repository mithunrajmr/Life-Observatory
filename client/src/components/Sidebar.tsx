import React from 'react';
import {
  Telescope,
  MessageSquare,
  BookOpen,
  GitCommit,
  Sparkles,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { TabType } from './Navbar';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCheckIn?: () => void;
  className?: string;
  onCloseMobile?: () => void;
}

const primaryNav: Array<{ id: TabType; label: string; icon: React.ReactNode; hint: string }> = [
  { id: 'observatory', label: 'Observatory', icon: <Telescope size={18} />, hint: 'Today’s vantage point' },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={18} />, hint: 'Your reflections' },
  { id: 'timeline', label: 'Timeline', icon: <GitCommit size={18} />, hint: 'Turning points' },
  { id: 'insights', label: 'Insights', icon: <Sparkles size={18} />, hint: 'What changed' },
  { id: 'goals', label: 'Goals', icon: <Target size={18} />, hint: 'Intentions & predictions' },
  { id: 'talk', label: 'Companion', icon: <MessageSquare size={18} />, hint: 'Talk it through' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  className = '',
  onCloseMobile,
}) => {
  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`w-[248px] bg-[#F7F6F2] border-r border-[#DDE2DD] flex flex-col h-screen sticky top-0 overflow-y-auto select-none ${className}`}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <button
          onClick={() => handleSelect('observatory')}
          className="flex items-center gap-3 group text-left w-full"
          aria-label="Life Observatory — home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#355C4A] text-[#F7F6F2] flex items-center justify-center shrink-0 group-hover:bg-[#284738] transition-colors">
            <Telescope size={18} strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <span className="font-heading font-bold text-[15px] text-[#1D2421] block leading-none">
              Life Observatory
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E] block mt-1.5">
              Observing since 2026
            </span>
          </div>
        </button>
      </div>

      <div className="h-px bg-[#DDE2DD] mx-5" />

      {/* Primary navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Primary">
        {primaryNav.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group w-full flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-xl transition relative text-left justify-start ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#1D2421] shadow-[0_1px_2px_rgba(29,36,33,0.04)] border border-[#DDE2DD]'
                  : 'text-[#66706B] hover:text-[#1D2421] hover:bg-[#EFEEE7] border border-transparent'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[#355C4A]" />
              )}
              <span className={`shrink-0 w-5 h-5 flex items-center justify-center ${isActive ? 'text-[#355C4A]' : 'text-[#8A938E] group-hover:text-[#66706B]'}`}>
                {item.icon}
              </span>
              <span className="flex flex-col min-w-0 text-left">
                <span className={`font-heading text-[13.5px] leading-tight block ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
                <span className="text-[10.5px] text-[#8A938E] leading-tight mt-0.5 truncate block">
                  {item.hint}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer: data & privacy */}
      <div className="px-3 pb-5 pt-2">
        <div className="h-px bg-[#DDE2DD] mx-2 mb-3" />
        <button
          onClick={() => handleSelect('connections')}
          aria-current={currentTab === 'connections' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left justify-start ${
            currentTab === 'connections'
              ? 'bg-[#FFFFFF] text-[#1D2421] border border-[#DDE2DD] shadow-[0_1px_2px_rgba(29,36,33,0.04)]'
              : 'text-[#66706B] hover:text-[#1D2421] hover:bg-[#EFEEE7] border border-transparent'
          }`}
        >
          <span className="shrink-0 w-5 h-5 flex items-center justify-center">
            <ShieldCheck size={18} className={currentTab === 'connections' ? 'text-[#355C4A]' : 'text-[#8A938E]'} />
          </span>
          <span className="flex flex-col text-left">
            <span className="font-heading text-[13.5px] font-medium leading-tight block">Data & Privacy</span>
            <span className="text-[10.5px] text-[#8A938E] leading-tight mt-0.5 block">Sources & control</span>
          </span>
        </button>
        <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#8A938E] text-center mt-4 leading-normal px-2">
          Private by design<br />Gemini on Cloud Run
        </p>
      </div>
    </aside>
  );
};
