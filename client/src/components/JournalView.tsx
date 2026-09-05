import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Sparkles, Filter, Loader2, RefreshCw } from 'lucide-react';
import { ReflectionInput } from './ReflectionInput';
import { api } from '../services/api';

interface JournalViewProps {
  onReflectionProcessed?: () => void;
}

interface ReflectionEntry {
  id: string;
  date: string;
  time: string;
  domain: string;
  domainColor: string;
  content: string;
  signals: string[];
  followUpQuestion?: string | null;
}

const DOMAIN_MAP: Record<string, { label: string; color: string }> = {
  career: { label: 'Career & Work', color: '#3A5A78' },
  learning: { label: 'Learning & Skills', color: '#355C4A' },
  health: { label: 'Health & Fitness', color: '#D96B43' },
  relationships: { label: 'Relationships', color: '#8C528D' },
  energy: { label: 'Mind & Energy', color: '#C58A45' },
  personal: { label: 'Personal Projects', color: '#06B6D4' },
  finance: { label: 'Financial Wellbeing', color: '#059669' },
};

const domains = [
  { id: 'all', label: 'All Domains' },
  { id: 'Career & Work', label: 'Career & Work' },
  { id: 'Learning & Skills', label: 'Learning' },
  { id: 'Health & Fitness', label: 'Health' },
  { id: 'Relationships', label: 'Relationships' },
  { id: 'Mind & Energy', label: 'Mind & Energy' },
  { id: 'Personal Projects', label: 'Personal' },
];

export const JournalView: React.FC<JournalViewProps> = ({ onReflectionProcessed }) => {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReflections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getReflections();
      const rawList = res.reflections || [];

      const mapped: ReflectionEntry[] = rawList.map((r: any) => {
        const occurred = new Date(r.occurredAt || r.createdAt);
        const isToday = new Date().toDateString() === occurred.toDateString();
        const dateStr = (isToday ? 'Today, ' : '') + occurred.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const timeStr = occurred.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        // Derive domain and signals from extracted events if available
        let primaryDomain = 'Personal Reflections';
        let domainColor = '#355C4A';
        const signals: string[] = [];

        if (r.events && r.events.length > 0) {
          const firstEv = r.events[0];
          const domKey = firstEv.domainIds?.[0] || 'personal';
          if (DOMAIN_MAP[domKey]) {
            primaryDomain = DOMAIN_MAP[domKey].label;
            domainColor = DOMAIN_MAP[domKey].color;
          }
          r.events.forEach((ev: any) => {
            if (ev.title) signals.push(ev.title);
          });
        }

        if (signals.length === 0) {
          signals.push('Observation recorded');
        }

        return {
          id: r.id,
          date: dateStr,
          time: timeStr,
          domain: primaryDomain,
          domainColor,
          content: r.content,
          signals,
          followUpQuestion: r.followUpQuestion,
        };
      });

      setReflections(mapped);
    } catch (err) {
      console.error('[JournalView] Failed to fetch reflections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  const handleReflectionSubmitted = async () => {
    await loadReflections();
    if (onReflectionProcessed) {
      onReflectionProcessed();
    }
  };

  const filteredEntries = reflections.filter(entry => {
    const matchesDomain = selectedDomain === 'all' || entry.domain.toLowerCase().includes(selectedDomain.toLowerCase());
    const matchesSearch = !searchQuery.trim() || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.signals.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in w-full mb-12">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DDE2DD] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
            <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#355C4A]">
              Personal Archive
            </span>
          </div>
          <h1 className="font-heading font-serif text-3xl sm:text-4xl text-[#1D2421] font-normal leading-tight">
            Journal & Daily Reflections
          </h1>
          <p className="text-xs sm:text-sm text-[#66706B] font-light max-w-xl mt-1.5 leading-relaxed">
            Every day you check in, quiet signals and compounding momentum are recorded. Your life is observed over time without questionnaires.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#DDE2DD] px-3.5 py-1.5 rounded-full text-xs text-[#66706B] shadow-xs shrink-0 self-start sm:self-auto">
          <BookOpen size={14} className="text-[#355C4A]" />
          <span className="font-medium text-[#1D2421]">{reflections.length} Recorded {reflections.length === 1 ? 'Entry' : 'Entries'}</span>
          <button 
            onClick={() => loadReflections()} 
            title="Refresh reflections"
            className="ml-1 hover:text-[#1D2421] transition"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Today's Reflection Composer */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-base text-[#1D2421] flex items-center gap-2">
          <Sparkles size={16} className="text-[#355C4A]" />
          <span>Write Today's Check-in</span>
        </h2>
        <ReflectionInput onReflectionProcessed={handleReflectionSubmitted} />
      </div>

      {/* Reflections Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter size={14} className="text-[#8A938E] shrink-0 mr-1" />
          {domains.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-medium transition shrink-0 ${
                selectedDomain === d.id
                  ? 'bg-[#355C4A] text-[#F7F6F2] shadow-xs'
                  : 'bg-[#FFFFFF] border border-[#DDE2DD] text-[#66706B] hover:text-[#1D2421] hover:bg-[#F1F2EE]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A938E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#DDE2DD] rounded-xl text-xs text-[#1D2421] placeholder:text-[#8A938E] focus:border-[#355C4A] shadow-xs"
          />
        </div>
      </div>

      {/* Reflections List */}
      <div className="space-y-4">
        {loading && reflections.length === 0 ? (
          <div className="py-12 text-center text-[#8A938E] bg-[#FFFFFF] border border-[#DDE2DD] rounded-2xl p-6 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-[#355C4A]" />
            <span className="text-sm">Loading your personal reflection records...</span>
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <article
              key={entry.id}
              className="card bg-[#FFFFFF] border border-[#DDE2DD] rounded-2xl p-6 shadow-xs hover:border-[#CBD4CB] transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#DDE2DD]/50">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.domainColor }}
                  />
                  <span className="font-heading font-bold text-sm text-[#1D2421]">
                    {entry.date}
                  </span>
                  <span className="text-[11px] text-[#8A938E]">
                    • {entry.time}
                  </span>
                </div>

                <span className="text-[11px] font-heading font-semibold text-[#355C4A] bg-[#EDF7F2] px-2.5 py-0.5 rounded-full">
                  {entry.domain}
                </span>
              </div>

              <p className="font-body text-sm text-[#1D2421] leading-relaxed mb-4">
                "{entry.content}"
              </p>

              {entry.followUpQuestion && (
                <div className="mb-4 p-3 bg-[#F9F8F5] border border-[#E5E9E5] rounded-xl text-xs text-[#66706B] italic">
                  <span className="font-medium text-[#355C4A] not-italic mr-1">Clarification:</span>
                  {entry.followUpQuestion}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-heading font-medium text-[#8A938E]">
                  Extracted signals:
                </span>
                {entry.signals.map((sig, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-[#F7F6F2] border border-[#DDE2DD] text-[#66706B] px-2.5 py-0.5 rounded-lg"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : reflections.length === 0 ? (
          <div className="py-14 text-center bg-[#FFFFFF] border border-[#DDE2DD] rounded-2xl p-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#EDF7F2] text-[#355C4A] flex items-center justify-center mx-auto mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="font-heading font-bold text-base text-[#1D2421] mb-1">No Reflections Recorded Yet</h3>
            <p className="text-xs sm:text-sm text-[#66706B] max-w-md mx-auto leading-relaxed mb-4">
              Your observatory reflects your real life. Write your first check-in above to start recording observations and building your trajectory.
            </p>
          </div>
        ) : (
          <div className="py-12 text-center text-[#8A938E] bg-[#FFFFFF] border border-[#DDE2DD] rounded-2xl p-6">
            <p className="text-sm">No reflections found matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
