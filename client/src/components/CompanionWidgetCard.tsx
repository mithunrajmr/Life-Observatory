import React from 'react';
import { ArrowRight, Lock, MessageSquare } from 'lucide-react';

interface CompanionWidgetCardProps {
  onStartConversation?: () => void;
}

export const CompanionWidgetCard: React.FC<CompanionWidgetCardProps> = ({
  onStartConversation,
}) => {
  return (
    <section
      className="card bg-[#FFFFFF] border border-[#DDE2DD] p-6 sm:p-7"
      aria-label="Your companion"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-full bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center shrink-0">
          <MessageSquare size={17} strokeWidth={1.9} />
        </span>
        <div>
          <span className="editorial-eyebrow">Your companion</span>
          <h3 className="font-editorial text-[1.25rem] leading-tight text-[#1D2421] mt-0.5">
            Talk it through
          </h3>
        </div>
      </div>

      <p className="text-[13.5px] text-[#66706B] leading-relaxed mb-4">
        A thinking partner that remembers your journey. Bring a decision, a worry, or a half-formed
        idea — and notice the patterns you can’t see from inside the week.
      </p>

      <button
        onClick={onStartConversation}
        className="btn-primary w-full justify-center gap-2 text-[13.5px] py-2.5"
      >
        <span>Start a conversation</span>
        <ArrowRight size={15} />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#8A938E] pt-3.5 mt-3.5 border-t border-[#DDE2DD]/60">
        <Lock size={12} className="text-[#355C4A]" />
        <span>Private — your reflections stay yours</span>
      </div>
    </section>
  );
};
