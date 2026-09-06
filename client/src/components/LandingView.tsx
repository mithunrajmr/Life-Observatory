import React from 'react';
import { LandingNav } from './landing/LandingNav';
import { LandingStorySpine } from './landing/LandingStorySpine';
import { LandingHero } from './landing/LandingHero';
import { ProblemNarrative } from './landing/ProblemNarrative';
import { TheShiftSequence } from './landing/TheShiftSequence';
import { HowItWorksJourney } from './landing/HowItWorksJourney';
import { ObservatoryInteractive } from './landing/ObservatoryInteractive';
import { DiscoveriesTriptych } from './landing/DiscoveriesTriptych';
import { EvidenceWhySection } from './landing/EvidenceWhySection';
import { CompanionExperienceSection } from './landing/CompanionExperienceSection';
import { ConnectedLifeSection } from './landing/ConnectedLifeSection';
import { LivePrototypeShowcase } from './landing/LivePrototypeShowcase';
import { TechStackArchitecture } from './landing/TechStackArchitecture';
import { VisionFooter } from './landing/VisionFooter';

interface LandingViewProps {
  onSignIn: () => void;
  onSignInRedirect?: () => void;
  onExploreDemo: () => void;
  authError?: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSignIn,
  onSignInRedirect,
  onExploreDemo,
  authError,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1D2421] flex flex-col selection:bg-[#355C4A]/15 antialiased font-body relative">
      {/* 1. Sticky Navigation Header with Scroll Indicator */}
      <LandingNav
        onSignIn={onSignIn}
        onExploreDemo={onExploreDemo}
      />

      {/* Floating Eye-Guidance Story Spine */}
      <LandingStorySpine />

      <main className="flex-1">
        {/* 2. Cinematic Hero & Telescope Aperture Preview */}
        <LandingHero
          onSignIn={onSignIn}
          onSignInRedirect={onSignInRedirect}
          onExploreDemo={onExploreDemo}
          authError={authError}
        />

        {/* 3. Act I: The Human Dilemma & Tool Comparison */}
        <ProblemNarrative />

        {/* 4. Act II: The Shift (5-Phase Interactive Pipeline) */}
        <TheShiftSequence />

        {/* 5. Act III: How It Works (The 6-Stage Planned Journey) */}
        <HowItWorksJourney />

        {/* 6. Act IV: The Observatory (Interactive Centerpiece Simulator) */}
        <ObservatoryInteractive
          onExploreDemo={onExploreDemo}
        />

        {/* 7. Act V: Longitudinal Discoveries (Invisible Progress, Reality Check, Possibilities) */}
        <DiscoveriesTriptych />

        {/* 8. Act VI: Evidence / Why (Transparent Provenance & Inspectable Drawer) */}
        <EvidenceWhySection />

        {/* 9. Act VII: The Conversational Companion (Ambient WhatsApp Vision vs. Live Crossroad Breakdown) */}
        <CompanionExperienceSection />

        {/* 10. Act VIII: Connected Life Context & Strict Privacy Boundaries */}
        <ConnectedLifeSection />

        {/* 11. Act IX: Authentic Live Prototype Proof (Real Screenshots & Cloud Run Verification) */}
        <LivePrototypeShowcase
          onExploreDemo={onExploreDemo}
          onSignIn={onSignIn}
        />

        {/* 12. Act X: Google Cloud & Gemini Engineering Foundations */}
        <TechStackArchitecture />
      </main>

      {/* 13. Philosophical Vision Climax, CTAs & Ethical Boundary Footer */}
      <VisionFooter
        onExploreDemo={onExploreDemo}
        onSignIn={onSignIn}
      />
    </div>
  );
};
