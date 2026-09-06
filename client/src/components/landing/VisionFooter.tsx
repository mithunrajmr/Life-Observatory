import React from 'react';
import { Telescope, ShieldAlert } from 'lucide-react';
import brandLogo from '../../assets/logo.png';

interface VisionFooterProps {
  onExploreDemo: () => void;
  onSignIn: () => void;
}

export const VisionFooter: React.FC<VisionFooterProps> = ({ onExploreDemo, onSignIn }) => {
  return (
    <footer className="bg-[#171C1A] text-[#FAF9F5] pt-24 pb-12 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-t from-[#355C4A]/30 via-transparent to-transparent blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-20 relative z-10">
        {/* Philosophical Vision Climax */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <blockquote className="font-editorial italic text-2xl sm:text-3xl text-[#DDE2DD] leading-relaxed">
            "We do not remember days, we remember moments. <br />
            <span className="text-[#C58A45]">But life is made of the days in between."</span>
          </blockquote>
          <p className="font-mono text-xs uppercase tracking-widest text-[#8A938E]">
            — Cesare Pavese
          </p>

          <div className="pt-6 space-y-3">
            <h2 className="font-editorial text-4xl sm:text-6xl text-[#FFFFFF] tracking-tight leading-[1.08]">
              Make gradual change visible.
            </h2>
            <p className="text-sm sm:text-base text-[#A8B2AC] max-w-xl mx-auto leading-relaxed">
              Step into your own observatory. Notice compounding progress, catch quiet drift, and navigate your journey with grounded evidence.
            </p>
          </div>

          {/* Action Callouts */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto bg-[#355C4A] hover:bg-[#284738] text-white font-heading font-semibold text-sm py-3.5 px-7 rounded-full shadow-md flex items-center justify-center gap-2 transition"
            >
              <Telescope size={16} />
              <span>Explore the Observatory</span>
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto bg-[#FFFFFF] hover:bg-[#F1F2EE] text-[#171C1A] font-heading font-semibold text-xs py-3.5 px-6 rounded-full transition flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>

            <a
              href="https://github.com/mithunrajmr/Life-Observatory"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#A8B2AC] hover:text-white px-3 py-2 transition flex items-center gap-1.5"
            >
              <span>GitHub</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>

        {/* Ethical Non-Clinical Boundary Alert */}
        <div className="p-5 rounded-2xl bg-[#232B28] border border-[#355C4A]/40 max-w-4xl mx-auto flex items-start gap-3.5 text-xs text-[#A8B2AC]">
          <ShieldAlert size={18} className="text-[#C58A45] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-heading font-bold text-[#FAF9F5] block">
              Ethical Non-Clinical Product Boundary
            </span>
            <p className="leading-relaxed">
              Life Observatory is a private cognitive instrument designed for longitudinal self-awareness, reflection, and philosophical perspective. It is <strong>not</strong> a medical device, <strong>not</strong> a clinical diagnostic tool, and <strong>not</strong> a substitute for licensed mental health therapy. All insights are grounded in your recorded evidence and never presume deterministic psychological diagnoses.
            </p>
          </div>
        </div>

        {/* Hairline Divider */}
        <hr className="border-[#28322E]" />

        {/* Bottom Metadata & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A938E]">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Logo" className="w-5 h-5 object-contain opacity-80" />
            <span>Life Observatory · Powered by Gemini on Google Cloud Run</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-mono">
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
            <span>•</span>
            <a href="mailto:mithunrajthrontok@gmail.com" className="hover:text-white transition">Contact Support</a>
            <span>•</span>
            <a href="https://github.com/mithunrajmr/Life-Observatory" target="_blank" rel="noreferrer" className="hover:text-white transition">Source</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
