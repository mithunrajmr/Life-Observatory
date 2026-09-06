import React from 'react';
import { Lock, EyeOff, Calendar, Mail, FileText, Trash2, CheckCircle2 } from 'lucide-react';

export const ConnectedLifeSection: React.FC = () => {
  const integrations = [
    {
      name: 'Google Calendar',
      icon: Calendar,
      color: '#3A5A78',
      whatWeObserve: 'Meeting start/end timestamps, daily meeting density, event category tags.',
      whatWeNeverTouch: 'Never creates, edits, or cancels events. Never inspects invitee private emails.',
      status: 'Live in Prototype',
    },
    {
      name: 'Gmail Metadata Rhythms',
      icon: Mail,
      color: '#D96B43',
      whatWeObserve: 'Message header timestamps and outgoing/incoming cadence (e.g. late-night communications).',
      whatWeNeverTouch: 'Email bodies, message text, subjects, attachments, and recipient identities are NEVER accessed or read.',
      status: 'Live in Prototype',
    },
    {
      name: 'Google Drive Revision Timestamps',
      icon: FileText,
      color: '#355C4A',
      whatWeObserve: 'File creation and update timestamps used strictly for deep work focus session detection.',
      whatWeNeverTouch: 'Document contents, file bodies, folder names, and file downloads are NEVER opened or read.',
      status: 'Live in Prototype',
    },
  ];

  return (
    <section id="connected-context" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="editorial-eyebrow">Act VII · Data Sovereignty &amp; Privacy</span>
          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            Objective grounding. <br />
            <span className="italic text-[#355C4A]">Without invasive surveillance.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            When you felt overwhelmed, were you losing focus, or did you simply have 38 hours of back-to-back meetings? Life Observatory adheres to a strict <strong>Metadata-Only Context Protocol</strong>.
          </p>
        </div>

        {/* The Absolute Privacy Guarantee Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] border-2 border-[#355C4A]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2ED] text-[#355C4A] flex items-center justify-center shrink-0 mt-0.5">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#1D2421]">
                The Strict Metadata-Only Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#4F5A55] leading-relaxed">
                We observe timestamps and rhythms — never the contents of your thoughts, messages, or files.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#355C4A]">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF2ED] border border-[#355C4A]/20">
              <CheckCircle2 size={13} />
              <span>Read-Only Scopes</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF2ED] border border-[#355C4A]/20">
              <CheckCircle2 size={13} />
              <span>Isolated Firestore</span>
            </span>
          </div>
        </div>

        {/* Matrix of Instruments: What We Observe vs What We NEVER Touch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.name}
                className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-2xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      <Icon size={18} />
                    </div>
                    <span className="badge badge-prototype text-[10px] font-mono">
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-[#1D2421]">
                    {item.name}
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#355C4A] font-bold block">
                        What We Observe:
                      </span>
                      <p className="text-[#4F5A55] leading-relaxed">
                        {item.whatWeObserve}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#E6EAE5]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#A95C58] font-bold flex items-center gap-1">
                        <EyeOff size={11} />
                        <span>What We NEVER Read:</span>
                      </span>
                      <p className="text-[#66706B] leading-relaxed">
                        {item.whatWeNeverTouch}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6EAE5] text-[11px] font-mono text-[#8A938E]">
                  User-controlled OAuth · Revocable at any time
                </div>
              </div>
            );
          })}
        </div>

        {/* Right to Complete Erasure Footer Note */}
        <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#66706B]">
          <div className="flex items-center gap-2">
            <Trash2 size={14} className="text-[#A95C58]" />
            <span><strong>Complete Right to Erasure:</strong> A single click in settings immediately and permanently purges all your records from Cloud Firestore.</span>
          </div>
          <span className="font-mono text-[11px] text-[#355C4A] shrink-0">
            Zero Training On User Data
          </span>
        </div>
      </div>
    </section>
  );
};
