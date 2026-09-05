import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, Filter } from 'lucide-react';
import { ReflectionInput } from './ReflectionInput';

interface JournalViewProps {
  onReflectionProcessed?: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ onReflectionProcessed }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleJournalEntries = [
    {
      id: 'j1',
      date: 'Today, Sep 5, 2026',
      time: '9:15 AM',
      domain: 'Career & Work',
      domainColor: '#3A5A78',
      content: 'Productive day. Wrapped up the project review and got positive feedback from leads. Feeling much more clarity on the next phase of architecture.',
      signals: ['Completed milestone', 'Leadership momentum', 'Confidence building'],
    },
    {
      id: 'j2',
      date: 'Sep 3, 2026',
      time: '7:00 AM',
      domain: 'Health & Fitness',
      domainColor: '#D96B43',
      content: 'Great run this morning. Rebuilt 6:30 AM cadence and feeling much more present. Breathing felt effortless through the second half.',
      signals: ['Morning routine anchored', 'Aerobic recovery', 'Consistency +12%'],
    },
    {
      id: 'j3',
      date: 'Aug 31, 2026',
      time: '6:45 PM',
      domain: 'Relationships',
      domainColor: '#8C528D',
      content: 'Hosted Sunday cookout with close friends to reconnect. Felt rested, grounded, and reminded that social time is active restoration, not a productivity tax.',
      signals: ['Social reconnection', 'Restorative balance', 'Friendship investment'],
    },
    {
      id: 'j4',
      date: 'Aug 26, 2026',
      time: '8:30 PM',
      domain: 'Learning & Growth',
      domainColor: '#355C4A',
      content: 'Finished the final module for Cloud Architecture and deployed prototype. That makes 35 consecutive days of daily practice.',
      signals: ['35-day streak milestone', 'Active builder mindset', 'Longitudinal shift'],
    },
    {
      id: 'j5',
      date: 'Aug 20, 2026',
      time: '10:00 PM',
      domain: 'Mind & Emotions',
      domainColor: '#C58A45',
      content: 'Felt a slight dip in energy this afternoon, but recognized it was accumulated fatigue from yesterday rather than a setback. Took a 20-minute walk instead of forcing focus.',
      signals: ['Metacognitive awareness', 'Recovery pacing', 'Gentle self-correction'],
    },
  ];

  const domains = [
    { id: 'all', label: 'All Domains' },
    { id: 'Career & Work', label: 'Career & Work' },
    { id: 'Learning & Growth', label: 'Learning' },
    { id: 'Health & Fitness', label: 'Health' },
    { id: 'Relationships', label: 'Relationships' },
    { id: 'Mind & Emotions', label: 'Mind & Energy' },
  ];

  const filteredEntries = sampleJournalEntries.filter(entry => {
    const matchesDomain = selectedDomain === 'all' || entry.domain === selectedDomain;
    const matchesSearch = !searchQuery.trim() || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.domain.toLowerCase().includes(searchQuery.toLowerCase());
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
          <span className="font-medium text-[#1D2421]">{sampleJournalEntries.length} Recorded Entries</span>
        </div>
      </div>

      {/* Today's Reflection Composer */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-base text-[#1D2421] flex items-center gap-2">
          <Sparkles size={16} className="text-[#355C4A]" />
          <span>Write Today's Check-in</span>
        </h2>
        <ReflectionInput onReflectionProcessed={onReflectionProcessed} />
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
        {filteredEntries.map(entry => (
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
        ))}

        {filteredEntries.length === 0 && (
          <div className="py-12 text-center text-[#8A938E] bg-[#FFFFFF] border border-[#DDE2DD] rounded-2xl p-6">
            <p className="text-sm">No reflections found matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
