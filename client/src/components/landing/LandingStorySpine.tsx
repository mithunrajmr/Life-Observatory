import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, ChevronUp } from 'lucide-react';

interface Chapter {
  id: string;
  num: string;
  title: string;
  tag: string;
}

const chapters: Chapter[] = [
  { id: 'story', num: '01', title: 'The Human Dilemma', tag: 'Psychology' },
  { id: 'shift', num: '02', title: 'Transformation Engine', tag: 'Architecture' },
  { id: 'how-it-works', num: '03', title: '6-Stage Journey', tag: 'Lifecycle' },
  { id: 'observatory', num: '04', title: 'The Observatory', tag: 'Centerpiece' },
  { id: 'discoveries', num: '05', title: 'Longitudinal Lenses', tag: 'Intelligence' },
  { id: 'companion', num: '06', title: 'Conversational Partner', tag: 'Memory' },
  { id: 'prototype', num: '07', title: 'Live Prototype Proof', tag: 'Cloud Run' },
];

export const LandingStorySpine: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>('story');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollY > 600);

      // Detect active chapter based on section positions
      for (let i = chapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(chapters[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveChapter(chapters[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentChapterObj = chapters.find((c) => c.id === activeChapter) || chapters[0];

  return (
    <>
      {/* Subtle Floating Narrative Beacon (Desktop & Tablet) */}
      <aside 
        aria-label="Story chapters navigation"
        className="fixed right-6 bottom-8 z-40 hidden md:flex flex-col items-end gap-2.5"
      >
        {/* Expanded Navigation Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="p-3.5 rounded-2xl bg-[#121715]/95 backdrop-blur-xl border border-[#3E8064]/30 shadow-2xl text-white space-y-1 w-64 mb-1"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#34D399] font-semibold uppercase tracking-wider">
                  <Compass size={13} className="animate-spin-slow" />
                  <span>Storyline Horizon</span>
                </div>
                <span className="text-[10px] font-mono text-white/50">
                  {Math.round(scrollProgress)}% Scrolled
                </span>
              </div>

              {chapters.map((chap) => {
                const isActive = chap.id === activeChapter;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      scrollToChapter(chap.id);
                      setIsExpanded(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left ${
                      isActive
                        ? 'bg-[#355C4A]/60 text-white font-bold border border-[#34D399]/40 shadow-xs'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-mono text-[11px] ${isActive ? 'text-[#34D399]' : 'text-white/40'}`}>
                        {chap.num}
                      </span>
                      <span className="truncate">{chap.title}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Capsule Controller */}
        <div className="flex items-center gap-2">
          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] shadow-md text-[#1D2421] flex items-center justify-center hover:bg-[#FAF9F5] transition"
              title="Return to top"
            >
              <ChevronUp size={16} />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#121715] border border-[#3E8064]/40 text-white shadow-xl hover:border-[#34D399] transition-all group"
            title="Toggle Chapter Navigation"
          >
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
              <span className="absolute w-4 h-4 rounded-full border border-[#34D399] animate-ping opacity-75" />
            </div>

            <div className="text-left font-mono leading-tight">
              <span className="text-[10px] text-[#34D399] block uppercase tracking-wider font-semibold">
                Act {currentChapterObj.num}
              </span>
              <span className="text-xs text-white/90 font-medium group-hover:text-white transition">
                {currentChapterObj.title}
              </span>
            </div>

            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-white/70 ml-1">
              {Math.round(scrollProgress)}%
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
