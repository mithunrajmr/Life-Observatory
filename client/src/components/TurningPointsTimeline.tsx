import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TurningPoint, DOMAIN_CONFIGS, DomainId } from '../types';

interface TurningPointsTimelineProps {
  turningPoints?: TurningPoint[];
  onUpdateStatus?: (id: string, status: 'confirmed' | 'rejected') => Promise<void>;
  onExploreMore?: () => void;
  compact?: boolean;
}

const IMPACT_META: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: 'Momentum gained', color: '#3E8064', bg: '#EDF7F2' },
  negative: { label: 'Course correction', color: '#B06A3B', bg: '#FBF1E7' },
  neutral: { label: 'A marked shift', color: '#5E6B7E', bg: '#EEF1F5' },
};

const clean = (s?: string | null): string =>
  (s || '').replace(/[*_`#>]+/g, '').replace(/\bundefined\b|\bnull\b/gi, '').replace(/\s{2,}/g, ' ').trim();

const domainOf = (tp: TurningPoint) => {
  const id = (tp.domainId || tp.domains?.[0]) as DomainId | undefined;
  return id && DOMAIN_CONFIGS[id] ? DOMAIN_CONFIGS[id] : null;
};

const shortDomain = (name: string) => name.split(/[ &]/)[0];

const fmtDate = (iso?: string, withYear = false) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
};

export const TurningPointsTimeline: React.FC<TurningPointsTimelineProps> = ({
  turningPoints,
  onExploreMore,
  compact = false,
}) => {
  const [filterDomain, setFilterDomain] = useState<string>('all');

  // Newest first — real data only, no fabricated defaults
  const points = useMemo(
    () =>
      (turningPoints || [])
        .filter((t) => t && t.title)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.occurredAt || b.timestamp || 0).getTime() -
            new Date(a.occurredAt || a.timestamp || 0).getTime()
        ),
    [turningPoints]
  );

  // Domains actually present drive the filter chips
  const presentDomains = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => {
      const id = p.domainId || p.domains?.[0];
      if (id) set.add(id);
    });
    return Array.from(set);
  }, [points]);

  const filtered =
    filterDomain === 'all'
      ? points
      : points.filter((p) => (p.domainId || p.domains?.[0]) === filterDomain);

  // ── Compact widget (Home) ──
  if (compact) {
    const list = points.slice(0, 3);
    return (
      <section className="card bg-[#FFFFFF] border border-[#DDE2DD] p-6 flex flex-col" aria-label="Turning points">
        <div className="flex items-center justify-between mb-5">
          <span className="editorial-eyebrow">Turning points</span>
          {points.length > 0 && (
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#8A938E]">
              {points.length} this season
            </span>
          )}
        </div>

        {list.length === 0 ? (
          <p className="text-[13.5px] text-[#66706B] leading-relaxed py-1">
            No turning points yet. They surface on their own as your reflections accumulate.
          </p>
        ) : (
          <ul className="space-y-4 flex-1">
            {list.map((tp) => {
              const cfg = domainOf(tp);
              const impact = IMPACT_META[tp.impact || 'neutral'];
              const shift = clean(tp.trajectoryShiftSummary) || clean(tp.description);
              return (
                <li key={tp.id} className="flex items-start gap-3 pb-3 border-b border-[#F0F2EF] last:border-0 last:pb-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shrink-0 mt-1 shadow-xs"
                    style={{ backgroundColor: cfg?.color || '#8A938E' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#66706B] font-semibold">
                        {fmtDate(tp.occurredAt || tp.timestamp)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#D3D8D2]" />
                      <span className="text-[10.5px] font-medium" style={{ color: impact.color }}>
                        {impact.label}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-semibold text-[#1D2421] leading-snug">{tp.title}</h4>
                    {shift && (
                      <p className="text-[12.5px] text-[#66706B] leading-relaxed mt-1 line-clamp-2">{shift}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {onExploreMore && points.length > 0 && (
          <button
            onClick={onExploreMore}
            className="group inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#355C4A] hover:gap-2 transition-all mt-5 pt-4 border-t border-[#DDE2DD]/70"
          >
            <span>Follow the full arc</span>
            <ArrowRight size={14} />
          </button>
        )}
      </section>
    );
  }

  // ── Full timeline (Timeline tab; header is rendered by the page) ──
  if (points.length === 0) {
    return (
      <div className="text-center py-16 border border-[#DDE2DD] rounded-2xl bg-[#FFFFFF]">
        <h3 className="font-editorial text-xl text-[#1D2421] mb-2">No turning points yet</h3>
        <p className="text-sm text-[#66706B] max-w-sm mx-auto">
          As you record reflections, the Observatory marks the moments where your trajectory visibly bends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Domain filters — only for domains that actually have turning points */}
      {presentDomains.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {[{ id: 'all', label: 'All' }, ...presentDomains.map((d) => ({ id: d, label: shortDomain(DOMAIN_CONFIGS[d as DomainId]?.name || d) }))].map(
            (f) => (
              <button
                key={f.id}
                onClick={() => setFilterDomain(f.id)}
                aria-pressed={filterDomain === f.id}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition ${
                  filterDomain === f.id
                    ? 'bg-[#1D2421] text-[#F7F6F2]'
                    : 'bg-[#FFFFFF] border border-[#DDE2DD] text-[#66706B] hover:text-[#1D2421] hover:border-[#C4CCC3]'
                }`}
              >
                {f.label}
              </button>
            )
          )}
        </div>
      )}

      {/* Vertical spine */}
      <div className="relative pl-8 sm:pl-10 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-[#DDE2DD]">
        <div className="space-y-5">
          {filtered.map((tp) => {
            const cfg = domainOf(tp);
            const impact = IMPACT_META[tp.impact || 'neutral'];
            const shift = clean(tp.trajectoryShiftSummary);
            const desc = clean(tp.description);
            return (
              <article key={tp.id} className="relative">
                <span
                  className="absolute -left-[27px] sm:-left-[32px] top-6 w-3.5 h-3.5 rounded-full ring-4 ring-[#F7F6F2] shadow-xs"
                  style={{ backgroundColor: cfg?.color || '#8A938E' }}
                />
                <div className="card bg-[#FFFFFF] border border-[#DDE2DD] p-5 sm:p-6 hover:border-[#C4CCC3] transition-colors">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                    <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#66706B]">
                      {fmtDate(tp.occurredAt || tp.timestamp, true)}
                    </span>
                    {cfg && (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                        {cfg.name}
                      </span>
                    )}
                    <span
                      className="text-[11.5px] font-medium px-2.5 py-0.5 rounded-full ml-auto"
                      style={{ backgroundColor: impact.bg, color: impact.color }}
                    >
                      {impact.label}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl sm:text-[1.55rem] text-[#1D2421] font-medium leading-snug">
                    {tp.title}
                  </h3>

                  {desc && <p className="text-[14px] text-[#4F5A55] leading-relaxed mt-2.5">{desc}</p>}

                  {shift && (
                    <div className="mt-4 pt-3.5 border-t border-[#EDECE6]">
                      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A938E] block mb-1">
                        How the trajectory shifted
                      </span>
                      <p className="text-[13.5px] text-[#1D2421] leading-relaxed">{shift}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
