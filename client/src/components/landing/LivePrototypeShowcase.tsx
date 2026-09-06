import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Telescope, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';

import screenshotObservatory from '../../assets/screenshots/02-observatory-live.png';
import screenshotConnections from '../../assets/screenshots/03-connections-live.png';
import screenshotInsights from '../../assets/screenshots/04-insights-live.png';
import screenshotCompanion from '../../assets/screenshots/05-companion-live.png';

interface LivePrototypeShowcaseProps {
  onExploreDemo: () => void;
  onSignIn: () => void;
}

export const LivePrototypeShowcase: React.FC<LivePrototypeShowcaseProps> = ({
  onExploreDemo,
  onSignIn,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const screens = [
    {
      id: 0,
      title: 'The Multi-Domain Horizon',
      tagline: 'Continuous Temporal Perception',
      image: screenshotObservatory,
      alt: 'Life Horizon view showing multi-domain momentum curves and turning points',
      description:
        'The main vantage point. Plots Career, Learning, Health, Energy, and Relationships along an aligned temporal axis without anxiety-inducing scores.',
      highlights: ['6-domain rolling momentum', 'Inspectable turning point pins', 'Daily conversational check-in'],
    },
    {
      id: 1,
      title: 'Connected Context & Privacy',
      tagline: 'Objective Factual Scaffolding',
      image: screenshotConnections,
      alt: 'Connected life settings showing read-only calendar and timestamp integrations',
      description:
        'Connects Google Calendar, Gmail metadata, and Drive timestamps with strict read-only permissions and absolute content privacy.',
      highlights: ['Zero access to message text', 'Granular OAuth toggles', 'One-click full data erasure'],
    },
    {
      id: 2,
      title: 'Longitudinal Insights & Evidence',
      tagline: 'Proactive Compounding Discovery',
      image: screenshotInsights,
      alt: 'Invisible progress card and inspectable evidence drawer',
      description:
        'Surfaces the progress your recency bias overlooked. Every insight features an expandable Evidence Drawer linking back to exact dates and reflection quotes.',
      highlights: ['"You may not have noticed this..."', 'What Changed comparative deltas', 'Transparent evidence reasoning'],
    },
    {
      id: 3,
      title: 'Longitudinal Thinking Partner',
      tagline: 'Multi-Month Memory Companion',
      image: screenshotCompanion,
      alt: 'Companion chat showing structured crossroad analysis and trajectory memory',
      description:
        'Dual-mode intelligence: warm conversational reflection for open inquiries, and a structured 5-part analytical breakdown for consequential life crossroads.',
      highlights: ['Remembers multi-month arc', 'One adaptive follow-up', 'Zero chat hallucination'],
    },
  ];

  return (
    <section id="prototype" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#F7F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2ED] text-[#355C4A] text-xs font-mono tracking-wider border border-[#355C4A]/25">
              <Sparkles size={13} className="text-[#355C4A]" />
              <span className="uppercase font-semibold text-[10.5px]">Proof of Reality · Deployed On Cloud Run</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
              Here is the real thing. <br />
              <span className="italic text-[#355C4A]">Built, deployed, and live today.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
              No conceptual mockups or faked interface mockups. These are unedited captures of the authenticated Life Observatory application running on Google Cloud Run.
            </p>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-3 self-start lg:self-end">
            <button
              onClick={onExploreDemo}
              className="btn-primary text-xs py-3 px-5 shadow-sm font-semibold flex items-center gap-2"
            >
              <Telescope size={15} />
              <span>Open Live Prototype</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#DDE2DD] pb-3">
          {screens.map((screen, idx) => {
            const isCurrent = activeTab === idx;
            return (
              <button
                key={screen.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-semibold transition ${
                  isCurrent
                    ? 'bg-[#355C4A] text-white shadow-2xs'
                    : 'bg-[#FFFFFF] border border-[#DDE2DD] text-[#66706B] hover:text-[#1D2421]'
                }`}
              >
                {screen.title}
              </button>
            );
          })}
        </div>

        {/* Browser Window Showcase Frame */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated overflow-hidden">
          {/* Browser Chrome Header */}
          <div className="bg-[#FAF9F5] px-5 py-3 border-b border-[#DDE2DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E8807A]" />
              <div className="w-3 h-3 rounded-full bg-[#F4BF4F]" />
              <div className="w-3 h-3 rounded-full bg-[#62C554]" />
            </div>

            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] text-[11px] font-mono text-[#66706B] max-w-sm w-full justify-center truncate">
              <span className="text-[#355C4A]">https://</span>
              <span>life-observatory-app-92008039582.us-central1.run.app</span>
            </div>

            <span className="text-[11px] font-mono text-[#3E8064] font-medium hidden sm:inline">
              Production Service Live
            </span>
          </div>

          {/* Screenshot Display & Context Pane */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 space-y-6"
            >
              {/* Image Container with subtle border */}
              <div className="rounded-2xl border border-[#DDE2DD] overflow-hidden shadow-sm bg-[#F7F6F2]">
                <img
                  src={screens[activeTab].image}
                  alt={screens[activeTab].alt}
                  className="w-full h-auto object-cover max-h-[580px] transition-transform duration-500 hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>

              {/* Bottom Feature Readout Strip */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-8 space-y-1.5">
                  <h3 className="font-heading font-bold text-base text-[#1D2421]">
                    {screens[activeTab].title} — <span className="font-normal text-[#66706B]">{screens[activeTab].tagline}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4F5A55] leading-relaxed">
                    {screens[activeTab].description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {screens[activeTab].highlights.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1.5 text-xs text-[#355C4A] font-medium">
                        <CheckCircle2 size={13} />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-end">
                  <button
                    onClick={onExploreDemo}
                    className="btn-primary text-xs py-2.5 px-4 justify-center gap-2"
                  >
                    <Telescope size={14} />
                    <span>Try With Demo Data</span>
                  </button>
                  <button
                    onClick={onSignIn}
                    className="btn-secondary text-xs py-2.5 px-4 justify-center gap-1.5"
                  >
                    <span>Sign In to Your Observatory</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
