import React, { useState, useEffect } from 'react';
import { Telescope, Menu, X } from 'lucide-react';
import brandLogo from '../../assets/logo.png';

interface LandingNavProps {
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onSignIn, onExploreDemo }) => {
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollPercent(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'The Problem', href: '#story' },
    { label: 'The Shift', href: '#shift' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Observatory', href: '#observatory' },
    { label: 'Evidence', href: '#evidence' },
    { label: 'Companion', href: '#companion' },
    { label: 'Live Prototype', href: '#prototype' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-[#DDE2DD]/80 shadow-xs transition-all">
      {/* Scroll Progress Hairline */}
      <div 
        className="absolute top-0 left-0 h-[2px] bg-[#355C4A] transition-all duration-75"
        style={{ width: `${scrollPercent}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Anchor */}
        <a 
          href="#" 
          className="flex items-center gap-3 group transition focus-visible:outline-none"
          aria-label="Life Observatory Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#DDE2DD] shadow-2xs p-1 flex items-center justify-center overflow-hidden group-hover:border-[#355C4A]/50 transition">
            {!logoError ? (
              <img 
                src={brandLogo} 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Telescope size={16} className="text-[#355C4A]" />
            )}
          </div>
          <div>
            <span className="font-heading font-bold text-sm tracking-tight text-[#1D2421] block leading-none">
              Life Observatory
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#8A938E] block mt-0.5">
              Personal Time Instrument
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Page navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-[#66706B] hover:text-[#1D2421] transition py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#355C4A] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Header Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onExploreDemo}
            className="text-xs font-semibold text-[#4F5A55] hover:text-[#1D2421] px-3.5 py-1.5 rounded-full hover:bg-[#EBECE7] transition"
            title="Explore with illustrative demo data"
          >
            Explore Demo
          </button>

          <button
            onClick={onSignIn}
            className="btn-primary text-xs py-2 px-4 shadow-2xs flex items-center gap-2 font-medium"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#4F5A55] hover:text-[#1D2421] hover:bg-[#EBECE7] transition"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DDE2DD] bg-[#F7F6F2] px-6 py-5 space-y-4 animate-fade-in shadow-lg">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#4F5A55] hover:text-[#1D2421] py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <hr className="border-[#DDE2DD]" />
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreDemo();
              }}
              className="btn-secondary w-full text-xs py-2.5 justify-center"
            >
              Explore Demo Preview
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
