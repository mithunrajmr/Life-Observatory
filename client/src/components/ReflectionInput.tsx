import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface ReflectionInputProps {
  onReflectionProcessed?: () => void;
  className?: string;
}

const MAX_LEN = 10000;

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  onReflectionProcessed,
  className = '',
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    events: any[];
    followUpQuestion: string | null;
  } | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const todayString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const overLimit = content.length > MAX_LEN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || overLimit) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await api.submitReflection(content.trim());
      setResult({
        events: response.events || [],
        followUpQuestion: response.followUpQuestion || null,
      });
      setContent('');
      onReflectionProcessed?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not record your reflection just now. Try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.submitReflection(`Follow-up clarification: ${followUpAnswer.trim()}`);
      setFollowUpAnswer('');
      setResult((prev) => (prev ? { ...prev, followUpQuestion: null } : null));
      onReflectionProcessed?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send that clarification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`card bg-[#FFFFFF] border border-[#DDE2DD] p-6 sm:p-7 ${className}`}
      aria-label="Daily Check-in"
    >
      {/* Header — editorial voice */}
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <span className="editorial-eyebrow">Today · {todayString}</span>
          <h2 className="font-editorial text-[1.4rem] sm:text-[1.6rem] leading-tight text-[#1D2421] mt-1.5">
            How was your day?
          </h2>
        </div>
      </div>

      <p className="text-[13.5px] text-[#66706B] leading-relaxed mb-4 max-w-md">
        Say what’s on your mind, in your own words. No forms — the Observatory listens and quietly connects the threads.
      </p>

      {/* Composer */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-[#F7F6F2] border border-[#DDE2DD] p-4 focus-within:border-[#355C4A] focus-within:bg-[#FFFFFF] transition-colors">
          <textarea
            value={content}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= MAX_LEN) {
                setContent(val);
              } else {
                setContent(val.slice(0, MAX_LEN));
              }
            }}
            maxLength={MAX_LEN}
            onKeyDown={handleKeyDown}
            placeholder="This morning I finally…"
            rows={3}
            className="w-full text-[14px] bg-transparent border-0 p-0 text-[#1D2421] placeholder:text-[#A0A8A2] focus:outline-none focus:ring-0 resize-none leading-relaxed"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#DDE2DD]/70">
            <span
              className={`font-mono text-[10px] tracking-[0.06em] ${
                content.length >= MAX_LEN ? 'text-[#C58A45] font-semibold' : 'text-[#8A938E]'
              }`}
            >
              {content.length >= 8000 ? (
                `${content.length.toLocaleString()} / ${MAX_LEN.toLocaleString()}${content.length >= MAX_LEN ? ' (limit reached)' : ''}`
              ) : (
                '⌘ + Enter to save'
              )}
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || overLimit}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#355C4A] text-white text-[13px] font-medium pl-3.5 pr-4 py-2 hover:bg-[#284738] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
              <span>{isSubmitting ? 'Saving' : 'Reflect'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <p className="text-[12.5px] text-[#A95C58] mt-2.5">
            {errorMsg}
          </p>
        )}
      </form>

      {/* What the Observatory noticed */}
      {result && (
        <div className="mt-5 pt-4 border-t border-[#DDE2DD] animate-fade-in">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3E8064] mb-2.5">
            <CheckCircle2 size={14} />
            <span>Noticed in what you wrote</span>
          </div>

          {result.events.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-1">
              {result.events.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 text-[12.5px] text-[#1D2421] bg-[#F7F6F2] pl-2.5 pr-3 py-1.5 rounded-full border border-[#DDE2DD]"
                >
                  {ev.domainIds?.[0] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#355C4A]" />
                  )}
                  <span className="truncate max-w-[220px]">{ev.title || ev.summary}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#66706B]">Saved. This becomes part of your longer arc.</p>
          )}

          {result.followUpQuestion && (
            <div className="p-3.5 bg-[#FAF3E8] border border-[#C58A45]/30 rounded-xl mt-3">
              <div className="flex items-start gap-2 mb-2.5">
                <Sparkles size={14} className="text-[#C58A45] shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium text-[#1D2421] leading-relaxed">
                  {result.followUpQuestion}
                </p>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value)}
                  placeholder="A quick note (optional)…"
                  className="flex-1 text-[13px] py-2 px-3 bg-[#FFFFFF] border border-[#DDE2DD] rounded-lg focus:border-[#355C4A] focus:outline-none"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !followUpAnswer.trim()}
                  className="btn-primary text-[13px] py-1.5 px-4"
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
