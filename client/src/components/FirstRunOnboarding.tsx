import React, { useState, useEffect } from 'react';
import { Calendar, Mail, HardDrive, ArrowRight, X, Shield, Compass } from 'lucide-react';

interface FirstRunOnboardingProps {
  onNavigateToConnections: () => void;
  hasActiveConnections: boolean;
}

export const FirstRunOnboarding: React.FC<FirstRunOnboardingProps> = ({
  onNavigateToConnections,
  hasActiveConnections,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only if not previously dismissed
    const dismissed = localStorage.getItem('lo_onboarding_dismissed');
    if (!dismissed) {
      // Gentle delayed entrance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('lo_onboarding_dismissed', 'true');
    setIsVisible(false);
  };

  const handleConnectNow = () => {
    localStorage.setItem('lo_onboarding_dismissed', 'true');
    setIsVisible(false);
    onNavigateToConnections();
  };

  if (!isVisible || hasActiveConnections) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1D2421]/30 backdrop-blur-xs transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-xl bg-[#FAF9F5] border border-[#DDE2DD] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-scale-in">
        {/* Subtle Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C58A45] via-[#355C4A] to-[#3A5A78]" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8A938E] hover:text-[#1D2421] hover:bg-[#EFF3EE] transition"
          aria-label="Close onboarding guide"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center">
            <Compass size={18} />
          </div>
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#355C4A] font-semibold">
            Welcome to Life Observatory
          </span>
        </div>

        <h2 id="onboarding-title" className="font-editorial text-2xl sm:text-3xl text-[#1D2421] font-normal leading-tight">
          Connect your life signals to see your true trajectory.
        </h2>

        <p className="text-sm text-[#66706B] mt-2.5 leading-relaxed">
          While reflections capture your inner narrative, external workspace signals ground your journey in real events. Connecting these sources reveals the context behind your focus, energy, and breakthroughs.
        </p>

        {/* The 3 Life Instruments */}
        <div className="mt-6 space-y-3">
          {/* Calendar */}
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E6EAE5] flex items-start gap-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FAF3E8] text-[#C58A45] flex items-center justify-center shrink-0 mt-0.5">
              <Calendar size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-xs text-[#1D2421]">Google Calendar</span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#FAF3E8] text-[#C58A45]">Read-only Schedule</span>
              </div>
              <p className="text-xs text-[#66706B] mt-0.5">
                Understand the context around your time — meetings, events, and changing commitments.
              </p>
            </div>
          </div>

          {/* Gmail */}
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E6EAE5] flex items-start gap-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#EDF3F8] text-[#3A5A78] flex items-center justify-center shrink-0 mt-0.5">
              <Mail size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-xs text-[#1D2421]">Gmail Signals</span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#EDF3F8] text-[#3A5A78]">Metadata Only</span>
              </div>
              <p className="text-xs text-[#66706B] mt-0.5">
                Surface useful patterns from your communication cadence without reading email contents.
              </p>
            </div>
          </div>

          {/* Drive */}
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E6EAE5] flex items-start gap-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center shrink-0 mt-0.5">
              <HardDrive size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold text-xs text-[#1D2421]">Google Drive</span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#EFF3EE] text-[#355C4A]">Timestamps Only</span>
              </div>
              <p className="text-xs text-[#66706B] mt-0.5">
                Connect the documents and creative artifacts that provide context for your deep work sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-5 flex items-center gap-2 text-xs text-[#8A938E] bg-[#EFF3EE]/50 p-2.5 rounded-xl border border-[#DDE2DD]/60">
          <Shield size={13} className="text-[#355C4A] shrink-0" />
          <span>Permissions are strictly read-only metadata. You can disconnect or purge data at any time.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDismiss}
            className="text-xs font-semibold text-[#8A938E] hover:text-[#1D2421] px-4 py-2.5 transition"
          >
            Skip for now
          </button>

          <button
            onClick={handleConnectNow}
            className="btn-primary text-xs py-2.5 px-5 shadow-sm flex items-center gap-2 font-heading font-semibold"
          >
            <span>Open Connections Settings</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
