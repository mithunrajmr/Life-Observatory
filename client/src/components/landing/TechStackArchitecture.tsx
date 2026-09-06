import React from 'react';
import { Server, Database, Shield, Cpu, Key, CheckCircle2 } from 'lucide-react';

export const TechStackArchitecture: React.FC = () => {
  const stack = [
    {
      name: 'Google Cloud Run',
      role: 'Serverless Production Backend',
      badge: 'Compute',
      color: '#4285F4',
      icon: Server,
      description:
        'Containerized Express/Node.js API that scales down to zero when quiet and handles compute-heavy momentum calibrations instantly.',
    },
    {
      name: 'Cloud Firestore',
      role: 'Isolated Longitudinal Data Storage',
      badge: 'Database',
      color: '#FFCA28',
      icon: Database,
      description:
        'Strictly isolated user subcollections (/users/{uid}/reflections) with custom temporal indices enabling fast multi-month synthesis.',
    },
    {
      name: 'Gemini 2.5 Flash & Flash-Lite',
      role: 'Constrained Schema Intelligence',
      badge: 'AI Engine',
      color: '#34A853',
      icon: Cpu,
      description:
        'Official @google/genai SDK with strict JSON response schemas that parse natural speech into candidate events without fabricating personal facts.',
    },
    {
      name: 'Firebase Authentication',
      role: 'Encrypted Identity & Token Exchange',
      badge: 'Identity',
      color: '#EA4335',
      icon: Shield,
      description:
        'Direct Google OAuth 2.0 flow with cryptographically verified JWT session tokens, eliminating cookie partitioning or credential leak risks.',
    },
    {
      name: 'Google Secret Manager',
      role: 'Enterprise OAuth Token Protection',
      badge: 'Security',
      color: '#4285F4',
      icon: Key,
      description:
        'Stores API keys and sensitive Google Workspace OAuth tokens in an encrypted vault, inaccessible to browser environments.',
    },
  ];

  return (
    <section id="architecture" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="editorial-eyebrow">Act IX · Technical Foundations</span>
          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            Engineered on Google Cloud. <br />
            <span className="italic text-[#355C4A]">Built for speed, security, and permanence.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            Every layer of Life Observatory is architected for strict data isolation, zero hallucination, and cryptographic user sovereignty.
          </p>
        </div>

        {/* Cloud Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-2xs space-y-4 hover:border-[#C4CCC3] transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A938E] font-semibold">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-[#1D2421]">
                      {item.name}
                    </h3>
                    <span className="font-mono text-xs text-[#355C4A] block mt-0.5">
                      {item.role}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4F5A55] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6EAE5] flex items-center gap-1.5 text-[11px] font-mono text-[#3E8064]">
                  <CheckCircle2 size={12} />
                  <span>Production Verified</span>
                </div>
              </div>
            );
          })}

          {/* Architectural Blueprint Card */}
          <div className="p-6 rounded-2xl bg-[#EDF7F2] border border-[#3E8064]/30 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="badge badge-prototype text-[10px] font-mono">
                System Boundary
              </span>
              <h3 className="font-heading font-bold text-base text-[#1D2421]">
                Zero Training Guarantee
              </h3>
              <p className="text-xs text-[#4F5A55] leading-relaxed">
                Your reflections and calendar rhythms are never utilized to train foundation models. All inferences are zero-retention API calls bounded strictly by user session context.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#3E8064]/20 text-[11px] font-mono text-[#355C4A] space-y-1">
              <div className="font-bold">Accelerate AI with Cloud Run</div>
              <div className="text-[10px] text-[#66706B]">Standard Security Hardened · SOC2 Compliant Cloud</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
