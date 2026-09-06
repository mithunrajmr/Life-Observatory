import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronDown, ChevronUp, FileText, Calendar, Database, CheckCircle, ArrowDown } from 'lucide-react';

export const EvidenceWhySection: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);

  return (
    <section id="evidence" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="editorial-eyebrow">Act V · Transparent Provenance</span>
          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            Why behind insights. <br />
            <span className="italic text-[#355C4A]">Never a black box.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            Generic AI chatbots invent confident opinions without proof. In Life Observatory, every single surfaced insight cites its exact historical provenance — complete with dates, quotes, and eligibility logic.
          </p>
        </div>

        {/* Interactive Evidence Anatomy Showcase */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-10 space-y-8">
          {/* Top Level: The Surfaced Insight */}
          <div className="p-6 rounded-2xl bg-[#EDF7F2] border border-[#3E8064]/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#355C4A]" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#355C4A]">
                  Verified Longitudinal Insight #IN-8492
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#66706B]">
                Confidence: High · 4 Corroborating Entries
              </span>
            </div>

            <h3 className="font-editorial text-xl sm:text-2xl text-[#1D2421]">
              "Writing momentum has decoupled from late-night fatigue"
            </h3>
            
            <p className="text-xs sm:text-sm text-[#4F5A55] leading-relaxed">
              Between June 18 and July 24, morning creative work was completed consistently across 4 separate weeks, even on days with 7+ hours of calendar meetings.
            </p>

            {/* Interactive Toggle Drawer Button */}
            <div className="pt-2 flex items-center justify-between border-t border-[#3E8064]/20">
              <span className="text-xs font-mono text-[#355C4A] font-medium">
                Direct Cloud Firestore provenance inspectable:
              </span>
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 text-[#355C4A] border-[#355C4A]/30 hover:bg-[#EBF2ED]"
              >
                <span>{drawerOpen ? 'Collapse Evidence Chain' : 'Inspect Evidence Chain'}</span>
                {drawerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Expanded Drawer: The 3-Part Evidence Provenance Hierarchy */}
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 pt-2 overflow-hidden"
              >
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#DDE2DD] text-xs font-mono text-[#8A938E]">
                    <ArrowDown size={12} />
                    <span>How This Insight Was Qualified By The Engine</span>
                    <ArrowDown size={12} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1: Supporting Raw Reflections */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E6EAE5] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1D2421]">
                      <FileText size={15} className="text-[#355C4A]" />
                      <span>1. Supporting Reflections</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#E6EAE5]">
                        <span className="text-[10px] font-mono text-[#8A938E] block">Jun 18 · Voice Note</span>
                        <p className="text-[#4F5A55] italic">"Managed 45m of writing at 6:30 AM before the team all-hands."</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#E6EAE5]">
                        <span className="text-[10px] font-mono text-[#8A938E] block">Jul 02 · Evening Entry</span>
                        <p className="text-[#4F5A55] italic">"Brutal client sprint, but morning paragraph was already locked in."</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Connected Context Grounding */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E6EAE5] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1D2421]">
                      <Calendar size={15} className="text-[#3A5A78]" />
                      <span>2. Connected Signals</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-[#E6EAE5]">
                        <span className="text-[10px] font-mono text-[#3A5A78] font-bold block">Google Calendar</span>
                        <p className="text-[#4F5A55]">6.8 hours avg meetings per day during both sample weeks.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#E6EAE5]">
                        <span className="text-[10px] font-mono text-[#C58A45] font-bold block">Google Drive Revisions</span>
                        <p className="text-[#4F5A55]">Document timestamps recorded between 06:34 AM and 07:18 AM.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Qualification Logic Gate */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E6EAE5] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1D2421]">
                      <Database size={15} className="text-[#C58A45]" />
                      <span>3. Engine Qualification Gate</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#3E8064]">
                        <CheckCircle size={14} />
                        <span>≥ 3 corroborate entries (Found: 4)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#3E8064]">
                        <CheckCircle size={14} />
                        <span>≥ 14-day temporal separation (Found: 36d)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#3E8064]">
                        <CheckCircle size={14} />
                        <span>Zero contradictory records found</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#E6EAE5] text-[11px] text-[#8A938E] font-mono">
                      Status: Passed eligibility threshold
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
