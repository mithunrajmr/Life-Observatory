import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Smartphone, Laptop, CheckCircle2, Play, Pause, XCircle } from 'lucide-react';

export const CompanionExperienceSection: React.FC = () => {
  const [activeCompanionMode, setActiveCompanionMode] = useState<'whatsapp' | 'crossroad'>('whatsapp');
  const [activeSampleChat, setActiveSampleChat] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const sampleConversations = [
    {
      id: 0,
      userVoice: true,
      voiceDuration: '0:18',
      userMessage: 'Crazy day. 6 client reviews, but held my writing boundary at 6:30 AM before anyone woke up.',
      aiAcknowledgment: 'Logged into Career & Learning domains.',
      aiFollowUp: '"That is 4 consecutive high-meeting days where your morning writing held steady. Are you energized by that anchor, or is fatigue building up?"',
      userLabel: 'Workload vs Boundary',
    },
    {
      id: 1,
      userVoice: false,
      voiceDuration: '',
      userMessage: 'Tired tonight. Skipped the gym because client work ran until 8 PM.',
      aiAcknowledgment: 'Noted in Health & Energy domains.',
      aiFollowUp: '"No guilt — your workout cadence was 3-for-3 earlier this week. Would you like to protect a 30-minute recovery walk tomorrow morning instead?"',
      userLabel: 'Grace Over Streaks',
    },
    {
      id: 2,
      userVoice: true,
      voiceDuration: '0:26',
      userMessage: 'Received an offer for an advisory board seat. Tempting title, but nervous about time commitment.',
      aiAcknowledgment: 'Grounded against your 90-day trajectory records.',
      aiFollowUp: '"In July, when your weekly meetings exceeded 24 hours, your Creative Craft score dropped 31%. Could you propose this as an asynchronous written review role?"',
      userLabel: 'Strategic Crossroad',
    },
  ];

  const handleSelectSample = (idx: number) => {
    setIsTyping(true);
    setIsPlayingAudio(false);
    setActiveSampleChat(idx);
    setTimeout(() => setIsTyping(false), 550);
  };

  return (
    <section id="companion" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] text-[#C58A45] text-xs font-mono font-bold border border-[#C58A45]/30">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
            <span>Act VI · The Conversational Companion</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            A thinking partner <br />
            <span className="italic text-[#355C4A] relative inline-block">
              with multi-month memory.
              <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-[#34D399] rounded-full opacity-70" />
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            Standard chatbots wake up with amnesia every morning. Life Observatory's companion understands your multi-month arc and never badgers you with endless chatter.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          <button
            onClick={() => setActiveCompanionMode('whatsapp')}
            className={`flex-1 p-5 rounded-2xl border text-left transition-all ${
              activeCompanionMode === 'whatsapp'
                ? 'bg-[#FFFFFF] border-[#C58A45] shadow-md scale-[1.01]'
                : 'bg-[#FFFFFF]/70 border-[#DDE2DD] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Smartphone size={17} className="text-[#C58A45]" />
                <span className="font-heading font-bold text-base text-[#1D2421]">
                  Ambient WhatsApp Daily Check-In
                </span>
              </div>
              <span className="badge badge-vision text-[9.5px] font-mono font-bold">
                Roadmap · Future Vision
              </span>
            </div>
            <p className="text-xs text-[#66706B] leading-relaxed">
              20-second voice notes while walking; met with one calibrated adaptive question.
            </p>
          </button>

          <button
            onClick={() => setActiveCompanionMode('crossroad')}
            className={`flex-1 p-5 rounded-2xl border text-left transition-all ${
              activeCompanionMode === 'crossroad'
                ? 'bg-[#FFFFFF] border-[#10B981] shadow-md scale-[1.01]'
                : 'bg-[#FFFFFF]/70 border-[#DDE2DD] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Laptop size={17} className="text-[#10B981]" />
                <span className="font-heading font-bold text-base text-[#1D2421]">
                  5-Part Crossroad Analysis
                </span>
              </div>
              <span className="badge badge-prototype text-[9.5px] font-mono font-bold">
                Live Prototype
              </span>
            </div>
            <p className="text-xs text-[#66706B] leading-relaxed">
              Rigorous strategic analysis for career and life transitions grounded in your real 90-day trajectory.
            </p>
          </button>
        </div>

        {/* Companion Interactive Stage Box */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-10 aperture-glow overflow-hidden">
          <AnimatePresence mode="wait">
            {activeCompanionMode === 'whatsapp' ? (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Narrative & Interactive Scenario Selectors */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] text-[#C58A45] text-xs font-mono font-bold border border-[#C58A45]/30">
                    <Sparkles size={13} />
                    <span>The Ambient WhatsApp Vision</span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    Test the single adaptive follow-up.
                  </h3>

                  <p className="text-sm sm:text-base text-[#4F5A55] leading-relaxed">
                    Most AI chatbots badger you with 10 generic questions. Life Observatory's companion gives you space to breathe, asking exactly <strong>one</strong> calibrated question only when an inflection point warrants deeper reflection.
                  </p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono font-bold text-[#1D2421] uppercase tracking-wider block">
                      Choose a simulated check-in:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sampleConversations.map((conv, idx) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectSample(idx)}
                          className={`text-xs font-mono py-2.5 px-3.5 rounded-xl border transition ${
                            activeSampleChat === idx
                              ? 'bg-[#355C4A] text-white border-[#355C4A] shadow-xs font-bold'
                              : 'bg-white text-[#4F5A55] border-[#DDE2DD] hover:bg-[#FAF9F5]'
                          }`}
                        >
                          ✦ {conv.userLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contrast comparison card */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#DDE2DD] space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#A95C58] font-bold">
                      <XCircle size={14} />
                      <span>Generic Chatbot: Amnesia &amp; Platitudes</span>
                    </div>
                    <p className="text-[#66706B] italic pl-5">
                      "Make sure to drink water and take a bubble bath! Here are 12 productivity tips."
                    </p>
                    <div className="flex items-center gap-2 text-[#355C4A] font-bold pt-1 border-t border-[#E6EAE5]">
                      <CheckCircle2 size={14} />
                      <span>Life Observatory: Grounded Longitudinal Context</span>
                    </div>
                    <p className="text-[#355C4A] pl-5 font-medium">
                      "Understands your 60-day baseline and checks whether your current pace is sustainable."
                    </p>
                  </div>
                </div>

                {/* Right Visual: Living Animated WhatsApp Simulator */}
                <div className="lg:col-span-6">
                  <div className="max-w-sm mx-auto rounded-3xl bg-[#0D1210] p-4 shadow-2xl border-4 border-[#222E26] space-y-3 font-body text-white">
                    {/* Masthead */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          🌌
                        </div>
                        <div>
                          <span className="font-heading font-bold text-xs text-white block">
                            Life Observatory
                          </span>
                          <span className="text-[10.5px] text-[#34D399] font-mono block">
                            ● Online · Ambient Companion
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/50">Today</span>
                    </div>

                    {/* User Bubble with Animated Voice Wave */}
                    <motion.div
                      key={`user-${activeSampleChat}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="self-end ml-auto max-w-[90%] bg-[#1F4432] p-3.5 rounded-2xl rounded-tr-xs shadow-md text-xs text-white space-y-2 border border-[#34D399]/30"
                    >
                      {sampleConversations[activeSampleChat].userVoice ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 bg-black/30 p-2 rounded-xl">
                            <button
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="w-7 h-7 rounded-full bg-[#34D399] text-[#0D1210] flex items-center justify-center shrink-0"
                            >
                              {isPlayingAudio ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
                            </button>
                            <div className="flex-1 flex items-center gap-1 h-5">
                              {[40, 70, 30, 85, 100, 60, 45, 90, 65, 30, 80, 50, 95, 40].map((h, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 rounded-full ${isPlayingAudio ? 'bg-[#34D399]' : 'bg-white/40'}`}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[10px] text-white/70">
                              {sampleConversations[activeSampleChat].voiceDuration}
                            </span>
                          </div>
                          <p className="text-white/90 leading-relaxed italic text-[11px]">
                            "{sampleConversations[activeSampleChat].userMessage}"
                          </p>
                        </div>
                      ) : (
                        <p className="leading-relaxed">
                          {sampleConversations[activeSampleChat].userMessage}
                        </p>
                      )}
                      <span className="text-[9px] text-white/50 text-right block">8:14 PM</span>
                    </motion.div>

                    {/* AI Bubble or Typing Indicator */}
                    {isTyping ? (
                      <div className="self-start mr-auto bg-white/10 p-3 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    ) : (
                      <motion.div
                        key={`ai-${activeSampleChat}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="self-start mr-auto max-w-[92%] bg-white/10 p-3.5 rounded-2xl rounded-tl-xs shadow-md text-xs text-white space-y-2 border border-white/10"
                      >
                        <p className="text-[10.5px] text-[#34D399] font-mono font-semibold">
                          ✦ {sampleConversations[activeSampleChat].aiAcknowledgment}
                        </p>
                        <p className="leading-relaxed text-white font-medium border-l-2 border-[#34D399] pl-2.5">
                          {sampleConversations[activeSampleChat].aiFollowUp}
                        </p>
                        <span className="text-[9px] text-white/50 text-right block">8:15 PM</span>
                      </motion.div>
                    )}

                    <div className="pt-2 text-[10px] font-mono text-center text-white/40">
                      End-to-end encrypted · Zero storage of raw audio
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="crossroad"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Narrative */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7F2] text-[#355C4A] text-xs font-mono font-bold">
                    <Laptop size={13} />
                    <span>Live In Prototype Today</span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    The 5-Part Crossroad Analysis.
                  </h3>

                  <p className="text-sm sm:text-base text-[#4F5A55] leading-relaxed">
                    When facing consequential decisions, generic chat gives generic cheerleading. Life Observatory provides a rigorous 5-pillar analytical breakdown grounded in your actual multi-month trajectory.
                  </p>

                  <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6EAE5] text-xs text-[#66706B] space-y-2">
                    <span className="font-bold text-[#1D2421]">5 Rigorous Analytical Pillars:</span>
                    <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-[#355C4A]">
                      <li>Long-Term Perspective</li>
                      <li>Current Momentum Alignment</li>
                      <li>Hidden Tradeoffs &amp; Friction</li>
                      <li>90-Day Trajectory Scenarios</li>
                      <li>Grounded Calibration Questions</li>
                    </ol>
                  </div>
                </div>

                {/* Right Visual: Structured Crossroad Output Preview */}
                <div className="lg:col-span-7">
                  <div className="p-6 rounded-2xl bg-[#0D1210] border border-white/10 shadow-xl space-y-3.5 text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                      <span className="font-heading font-bold text-white">
                        Crossroad: "Should I accept the external advisory role?"
                      </span>
                      <span className="badge badge-prototype text-[10px] font-mono">
                        Trajectory Grounded
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-[10px] text-[#38BDF8] font-bold block uppercase">
                          1. PERSPECTIVE &amp; MOMENTUM
                        </span>
                        <p className="text-white/80 leading-relaxed font-sans text-xs">
                          Your stated 6-month priority is establishing your independent architecture practice. This role boosts prestige, but directly competes with your protected morning hours.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-[10px] text-[#F59E0B] font-bold block uppercase">
                          2. CALENDAR EVIDENCE
                        </span>
                        <p className="text-white/80 leading-relaxed font-sans text-xs">
                          In July, when weekly meeting hours exceeded 24 hours, your Creative Energy score declined by 31% within 10 days.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 space-y-1">
                        <span className="text-[10px] text-[#34D399] font-bold block uppercase">
                          3. CALIBRATION QUESTION
                        </span>
                        <p className="text-white font-medium leading-relaxed font-sans text-xs">
                          "Could you structure the commitment as asynchronous written reviews rather than live meetings to protect your 6:30 AM boundary?"
                        </p>
                      </div>
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
