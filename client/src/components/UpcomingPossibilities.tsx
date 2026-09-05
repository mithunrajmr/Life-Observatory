import React, { useState } from 'react';
import { Briefcase, Heart, Users, Compass } from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';

interface UpcomingPossibilitiesProps {
  onExploreSuggestions?: () => void;
}

export const UpcomingPossibilities: React.FC<UpcomingPossibilitiesProps> = ({
  onExploreSuggestions,
}) => {
  const [showDriftModal, setShowDriftModal] = useState(false);

  const possibilities = [
    {
      id: 'p1',
      icon: <Briefcase size={14} />,
      color: '#3A5A78',
      text: "You're likely to complete your current project by mid-September based on your steady focus patterns.",
      badge: 'Career & Work',
    },
    {
      id: 'p2',
      icon: <Heart size={14} />,
      color: '#D96B43',
      text: "Good momentum in fitness — strong potential to reach your 3-month habit consistency goal.",
      badge: 'Health & Fitness',
    },
    {
      id: 'p3',
      icon: <Users size={14} />,
      color: '#7A5B82',
      text: "Something may be getting crowded out: Work has occupied most recent weekends. Prioritizing close friendships often restores your energy.",
      badge: 'Social Balance',
      hasExplore: true,
    },
  ];

  return (
    <>
      <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] p-7 sm:p-8">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#DDE2DD]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C58A45]" />
            <h3 className="font-editorial text-xl text-[#1D2421] font-medium">
              Upcoming Possibilities
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#8A938E]">
            Derived from current momentum
          </span>
        </div>

        {/* Prospective Ledger List */}
        <div className="divide-y divide-[#EDECE6]">
          {possibilities.map(item => (
            <div 
              key={item.id} 
              className="py-4.5 first:pt-0 last:pb-0 flex items-start gap-4 group"
            >
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>

              <div className="flex-1">
                <p className="text-[14px] text-[#2C3531] leading-relaxed font-light">
                  {item.text}
                </p>

                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A938E]">
                    {item.badge}
                  </span>

                  {item.hasExplore && (
                    <button
                      onClick={() => setShowDriftModal(true)}
                      className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#355C4A] hover:underline"
                    >
                      <Compass size={13} />
                      <span>Explore this observation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-[#DDE2DD] flex justify-end">
          <button
            onClick={onExploreSuggestions}
            className="text-xs font-semibold text-[#355C4A] hover:text-[#284738] flex items-center gap-1 transition"
          >
            <span>Set an intentional hypothesis from these patterns →</span>
          </button>
        </div>
      </div>

      {showDriftModal && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setShowDriftModal(false)}
          title="Something may be getting crowded out"
          explanation="Your recent records indicate that work commitments have occupied most weekends for three consecutive weeks. You previously noted that weekend restorative time with close friends is essential for your mental clarity."
          evidence={[
            {
              sourceType: 'calendar',
              sourceRef: 'cal_event_weekend_crunch',
              summary: 'Weekend blocks occupied by sprint delivery during late July and early August',
              occurredAt: new Date(Date.now() - 21 * 86400000).toISOString(),
              confidence: 0.91,
            },
            {
              sourceType: 'user_reflection',
              sourceRef: 'user_ref_energy_notes',
              summary: 'Noted fatigue and missed dinner gatherings with friends during project crunch',
              occurredAt: new Date(Date.now() - 42 * 86400000).toISOString(),
              confidence: 0.94,
            },
          ]}
          confidence="high"
        />
      )}
    </>
  );
};
