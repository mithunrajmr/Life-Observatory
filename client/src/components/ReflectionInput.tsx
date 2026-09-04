import React, { useState } from 'react';
import { Feather, Send, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { DOMAIN_CONFIGS } from '../types';

interface ReflectionInputProps {
  onReflectionProcessed?: () => void;
}

export const ReflectionInput: React.FC<ReflectionInputProps> = ({ onReflectionProcessed }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    events: any[];
    followUpQuestion: string | null;
  } | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await api.submitReflection(content.trim());
      setResult({
        events: response.events,
        followUpQuestion: response.followUpQuestion,
      });
      setContent('');
      if (onReflectionProcessed) {
        onReflectionProcessed();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit reflection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitReflection(`Follow-up clarification: ${followUpAnswer.trim()}`);
      setFollowUpAnswer('');
      setResult(prev => prev ? { ...prev, followUpQuestion: null } : null);
      if (onReflectionProcessed) {
        onReflectionProcessed();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit clarification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-8 animate-fade-in border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Feather size={18} className="text-indigo-400" />
        <h2 className="text-base font-bold text-white">Daily Reflection</h2>
        <span className="text-xs text-slate-500">• Natural language, zero questionnaire</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was today? What did you work on, struggle with, or experience? (e.g. 'Rough day. Finished the main feature, had a tough sync, but finally went for a run.')"
          className="w-full h-24 text-sm resize-none"
          disabled={isSubmitting}
        />

        {errorMsg && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            Gemini incrementally extracts life events and updates your Life Horizon.
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Send size={14} /> Record Reflection
              </>
            )}
          </button>
        </div>
      </form>

      {/* Extracted Structured Signals Feedback */}
      {result && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
            <CheckCircle size={14} />
            <span>Incorporated into Life Model: {result.events.length} observations derived</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.events.map((ev, idx) => (
              <div 
                key={idx} 
                className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2"
              >
                <span className="font-medium text-slate-200">{ev.title}</span>
                {ev.domainIds.map((domId: any) => {
                  const d = domId as any;
                  const cfg = (DOMAIN_CONFIGS as any)[d];
                  return (
                    <span 
                      key={d} 
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: `${cfg?.color || '#818CF8'}20`, color: cfg?.color || '#818CF8' }}
                    >
                      {cfg?.name || d}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Single Gated Follow-up Question if materially ambiguous */}
          {result.followUpQuestion && (
            <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
              <div className="flex items-start gap-2.5 mb-2">
                <HelpCircle size={16} className="text-indigo-400 mt-0.5" />
                <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                  {result.followUpQuestion}
                </p>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value)}
                  placeholder="Optional clarification..."
                  className="flex-1 text-xs py-1.5 px-3"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !followUpAnswer.trim()}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
