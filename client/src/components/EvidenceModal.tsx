import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Calendar, BookOpen, MessageSquare } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidence?: EvidenceItem[];
  confidence?: string;
  explanation?: string;
}

// Clean internal prompts, ISO timestamps, and prefixes that might leak into summaries
const cleanSummary = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/Occurred At:\s*[\d\-:T.Z]+\s*/gi, '')
    .replace(/^(?:User Reflection:\s*)+/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/^["']|["']$/g, '')
    .trim();
};

const formatEvidenceDate = (dStr?: string): string => {
  if (!dStr) return 'Observed in timeline';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return 'Observed in timeline';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  title,
  evidence = [],
  confidence = 'high',
  explanation,
}) => {
  if (!isOpen) return null;

  const getSourceIcon = (sourceType?: string) => {
    switch (sourceType) {
      case 'calendar':
        return <Calendar size={15} className="text-[#3A5A78]" />;
      case 'user_reflection':
        return <BookOpen size={15} className="text-[#355C4A]" />;
      case 'conversation':
        return <MessageSquare size={15} className="text-[#C58A45]" />;
      default:
        return <ShieldCheck size={15} className="text-[#355C4A]" />;
    }
  };

  // Aggressively deduplicate and clean evidence items
  const processedEvidence = React.useMemo(() => {
    const seen = new Set<string>();
    const deduped: EvidenceItem[] = [];
    for (const item of evidence) {
      const cleaned = cleanSummary(item.summary);
      if (!cleaned) continue;
      // Key by normalized first 60 chars of cleaned summary
      const key = cleaned.toLowerCase().slice(0, 60).replace(/\s+/g, ' ');
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push({
          ...item,
          summary: cleaned,
        });
      }
    }
    return deduped;
  }, [evidence]);

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2421]/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
    >
      <div 
        className="bg-[#FFFFFF] border border-[#DDE2DD] rounded-[24px] shadow-xl w-full max-w-xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DDE2DD]/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#355C4A] block">
                Observation Provenance
              </span>
              <h3 id="evidence-modal-title" className="font-editorial text-xl sm:text-[1.35rem] font-medium text-[#1D2421] leading-tight mt-0.5">
                Why am I seeing this?
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F1F2EE] text-[#8A938E] hover:text-[#1D2421] transition"
            aria-label="Close evidence details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Insight Title & Explanation */}
        <div className="mb-5">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#8A938E] mb-1">
            Grounded Observation
          </p>
          <h4 className="font-editorial text-lg sm:text-xl text-[#1D2421] font-medium leading-snug">
            "{title}"
          </h4>
          {explanation && (
            <p className="text-[13px] text-[#4F5A55] leading-relaxed mt-2.5 pl-3 border-l-2 border-[#355C4A]/40">
              {explanation}
            </p>
          )}
        </div>

        {/* Signal confidence badge */}
        <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#EFF3EE] border border-[#D9E3D9] mb-5">
          <span className="text-[11.5px] font-medium text-[#355C4A]">Signal Confidence:</span>
          <span className="font-mono text-[10px] tracking-[0.1em] font-semibold text-[#355C4A] uppercase">
            {confidence === 'high' ? 'High · Consistent Pattern' : 'Early Signal · Accumulating'}
          </span>
        </div>

        {/* Supporting Evidence Items */}
        <div className="space-y-3 mb-6">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A938E] block">
            Observed Moments in Your Arc
          </span>

          {processedEvidence.length === 0 ? (
            <p className="text-xs text-[#66706B] italic py-2">
              Synthesized from longitudinal reflection trends across your timeline.
            </p>
          ) : (
            processedEvidence.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#DDE2DD]/80 flex items-start gap-3 transition hover:border-[#CBD4CB]"
              >
                <div className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#DDE2DD] shrink-0 mt-0.5">
                  {getSourceIcon(item.sourceType)}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-body font-normal text-[#1D2421] leading-relaxed text-[13px]">
                    {item.summary}
                  </p>
                  <span className="font-mono text-[10px] text-[#8A938E] block mt-1.5 tracking-wide">
                    {formatEvidenceDate(item.occurredAt)}
                    {' · '}
                    {item.sourceType === 'calendar' ? 'Google Calendar Record' : 'Personal Reflection'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grounding statement & close */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#DDE2DD]/70">
          <p className="text-[11.5px] text-[#8A938E] leading-relaxed max-w-xs">
            We show this because these real events were observed in your timeline.
          </p>

          <button
            onClick={onClose}
            className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-6 py-2.5 hover:bg-[#284738] transition shadow-xs self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
