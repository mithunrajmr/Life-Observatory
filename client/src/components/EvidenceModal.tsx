import React from 'react';
import { X, ShieldCheck, Calendar, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidence: EvidenceItem[];
  confidence?: string;
  explanation?: string;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  title,
  evidence,
  confidence,
  explanation,
}) => {
  if (!isOpen) return null;

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'calendar':
        return <Calendar size={18} className="text-teal-400" />;
      case 'user_reflection':
        return <BookOpen size={18} className="text-indigo-400" />;
      case 'conversation':
        return <MessageSquare size={18} className="text-amber-400" />;
      default:
        return <ShieldCheck size={18} className="text-slate-400" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
    >
      <div className="card w-full max-w-lg animate-fade-in relative max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Close evidence details"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-indigo-400" />
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Evidence & Provenance
          </span>
        </div>

        <h2 id="evidence-modal-title" className="text-xl font-bold mb-2 text-white">
          {title}
        </h2>

        {explanation && (
          <p className="text-sm text-slate-300 mb-6 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {explanation}
          </p>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
            <span>Observed Source Records</span>
            {confidence && (
              <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                Confidence: {confidence}
              </span>
            )}
          </div>

          {evidence.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-lg text-slate-400 text-sm">
              <AlertCircle size={18} />
              <span>Limited individual event records for this window. Trajectory derived from aggregate signals.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-start gap-3 hover:border-slate-700 transition"
                >
                  <div className="mt-0.5">{getSourceIcon(item.sourceType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Source: {item.sourceType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(item.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Verified against user Life Model</span>
          <button 
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-4"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
