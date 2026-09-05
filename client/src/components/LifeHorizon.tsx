import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { LifeSnapshot } from '../types';

interface LifeHorizonProps {
  snapshot: LifeSnapshot | null;
  onSelectTurningPoint?: (id?: string) => void;
  isLoading?: boolean;
  onRetry?: () => void;
}

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  career: { label: 'Career', color: '#3A5A78' },
  learning: { label: 'Learning', color: '#355C4A' },
  health: { label: 'Health', color: '#D96B43' },
  relationships: { label: 'Relationships', color: '#7A5B82' },
  energy: { label: 'Energy', color: '#C58A45' },
  personal: { label: 'Personal', color: '#4A7C59' },
  finance: { label: 'Finance', color: '#2E6F54' },
};

const ORDER = ['learning', 'health', 'personal', 'energy', 'career', 'relationships', 'finance'];

interface Series {
  key: string;
  label: string;
  color: string;
  cumulative: number[];
  end: number;
  direction: string;
}

// Catmull-Rom → cubic bézier for a flowing ridgeline
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const LifeHorizon: React.FC<LifeHorizonProps> = ({
  snapshot,
  onSelectTurningPoint,
  isLoading = false,
  onRetry,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(960);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeTp, setActiveTp] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // The chart is never wider than the viewport; cap by the document width so a
    // stale/oversized container measurement can't force a horizontal overflow.
    const widthOf = () => {
      const doc = document.documentElement.clientWidth || 960;
      return Math.min(el.clientWidth || doc, doc);
    };
    const measure = () => setW(widthOf());
    measure();
    // Re-measure across a short window after mount. Some environments settle the
    // viewport a few hundred ms after load (device emulation, late font load,
    // orientation change) without firing resize/RO, so poll a bounded budget
    // rather than stopping the moment the width looks momentarily stable.
    let raf = 0;
    let frames = 0;
    let last = widthOf();
    const poll = () => {
      const cw = widthOf();
      if (cw !== last) {
        last = cw;
        setW(cw);
      }
      if (++frames < 90) raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Build cumulative series from real domain points
  const { series, dates, turningPoints } = useMemo(() => {
    const ds = snapshot?.domainStates || {};
    const out: Series[] = [];
    let dateList: string[] = [];
    for (const key of ORDER) {
      const state = (ds as any)[key];
      if (!state || !Array.isArray(state.points) || state.points.length === 0) continue;
      const pts = state.points;
      if (!dateList.length) dateList = pts.map((p: any) => p.date);
      let running = 0;
      const cumulative = pts.map((p: any) => {
        running += typeof p.value === 'number' ? p.value : 0;
        return running;
      });
      const hasSignal = cumulative.some((v: number) => Math.abs(v) > 0.001);
      if (!hasSignal) continue; // skip flat/insufficient domains (e.g. finance)
      const meta = DOMAIN_META[key] || { label: key, color: '#7B8580' };
      out.push({
        key,
        label: meta.label,
        color: meta.color,
        cumulative,
        end: cumulative[cumulative.length - 1],
        direction: state.direction || 'stable',
      });
    }
    const tps = (snapshot?.turningPoints || []).slice().sort(
      (a, b) => new Date(a.occurredAt || 0).getTime() - new Date(b.occurredAt || 0).getTime()
    );
    return { series: out, dates: dateList, turningPoints: tps };
  }, [snapshot]);

  // Data-derived masthead headline
  const headline = useMemo(() => {
    if (!series.length) return { lead: 'Your horizon', sub: 'Reflections and connected activity will shape the view over time.' };
    const leader = series.reduce((a, b) => (b.end > a.end ? b : a));
    const rising = series.filter((s) => s.end > 0.03).length;
    const declining = series.filter((s) => s.end < -0.03).length;
    const timeframeText = snapshot?.period?.from && snapshot?.period?.to 
      ? `From ${snapshot.period.from} to ${snapshot.period.to}`
      : 'Across the observed timeframe';

    let trajectoryNote = 'steady equilibrium across domains';
    if (rising > declining) {
      trajectoryNote = `${rising} of ${series.length} domains bending upward`;
    } else if (declining > rising) {
      trajectoryNote = `${declining} of ${series.length} domains reflecting downward strain`;
    }

    return {
      lead: `A season shaped by ${leader.label.toLowerCase()}.`,
      sub: `${timeframeText}, with ${trajectoryNote}.`,
    };
  }, [series, snapshot]);

  // ── Loading skeleton ──
  if (isLoading && !snapshot) {
    return (
      <section className="animate-fade-soft">
        <div className="h-3 w-40 bg-[#EBECE7] rounded mb-4" />
        <div className="h-9 w-2/3 bg-[#EBECE7] rounded mb-6" />
        <div className="h-[300px] w-full bg-gradient-to-b from-[#F1F2EE] to-[#F7F6F2] rounded-2xl border border-[#DDE2DD]" />
      </section>
    );
  }

  // ── Empty / error ──
  if (!series.length) {
    return (
      <section className="text-center py-16 border border-[#DDE2DD] rounded-2xl bg-[#FFFFFF]">
        <p className="editorial-eyebrow mb-2">The Life Horizon</p>
        <h2 className="font-editorial text-2xl text-[#1D2421] mb-2">The view is still forming</h2>
        <p className="text-sm text-[#66706B] max-w-sm mx-auto mb-5">
          Once a few reflections are recorded, your domains begin to trace their arc across the weeks.
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary text-xs mx-auto">
            <RefreshCw size={13} />
            Refresh the view
          </button>
        )}
      </section>
    );
  }

  // ── Geometry ──
  const H = Math.max(260, Math.min(400, Math.round(w * 0.34)));
  const padL = 20;
  const padR = 24;
  const padT = 44;
  const padB = 40;
  const plotW = Math.max(10, w - padL - padR);
  const plotH = Math.max(10, H - padT - padB);
  const n = dates.length;

  const allVals = series.flatMap((s) => s.cumulative);
  let minV = Math.min(0, ...allVals);
  let maxV = Math.max(0, ...allVals);
  const span = maxV - minV || 1;
  minV -= span * 0.12;
  maxV += span * 0.22;

  const xAt = (i: number) => padL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * plotH;
  const zeroY = yAt(0);

  // Precompute each ridgeline's smooth path + its area (down to the zero baseline)
  const lines = series.map((s) => {
    const pts = s.cumulative.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
    const line = smoothPath(pts);
    const first = pts[0];
    const last = pts[pts.length - 1];
    const area = `${line} L ${last.x.toFixed(1)} ${zeroY.toFixed(1)} L ${first.x.toFixed(1)} ${zeroY.toFixed(1)} Z`;
    return { ...s, pts, line, area, endPt: last };
  });
  // Draw larger-reaching domains behind so fills layer like receding hills
  const fillOrder = [...lines].sort((a, b) => Math.abs(b.end) - Math.abs(a.end));

  // Month boundary labels
  const monthMarks: { x: number; label: string }[] = [];
  let lastMonth = -1;
  dates.forEach((d, i) => {
    const dt = new Date(d);
    const m = dt.getMonth();
    if (m !== lastMonth) {
      monthMarks.push({ x: xAt(i), label: MONTH_NAMES[m] });
      lastMonth = m;
    }
  });

  const dateIndex = (iso?: string) => {
    if (!iso) return -1;
    const target = new Date(iso).getTime();
    let best = 0;
    let bestDiff = Infinity;
    dates.forEach((d, i) => {
      const diff = Math.abs(new Date(d).getTime() - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    });
    return best;
  };

  return (
    <section aria-label="Longitudinal Evidence Trajectory" className="relative">
      {/* Evidence copy */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[#355C4A] font-semibold">
            Longitudinal Evidence
          </span>
          <span className="h-px w-6 bg-[#DDE2DD]" />
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#8A938E]">
            12-Week Trajectory Arc · Jun–Sep 2026
          </span>
        </div>
        <h2 className="font-editorial text-[1.65rem] sm:text-[2.1rem] leading-[1.12] tracking-[-0.015em] text-[#1D2421]">
          {headline.lead}
        </h2>
        <p className="text-[14.5px] text-[#66706B] leading-relaxed mt-2 max-w-2xl">
          {headline.sub}
        </p>
      </div>

      {/* Chart */}
      <div ref={wrapRef} className="mt-6 select-none">
        <svg
          viewBox={`0 0 ${w} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto overflow-visible"
          role="img"
          aria-label="Cumulative momentum across life domains from June to September 2026"
        >
          <defs>
            <linearGradient id="horizonWash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#355C4A" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#355C4A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ambient wash above the zero line */}
          <rect x={padL} y={padT} width={plotW} height={Math.max(0, zeroY - padT)} fill="url(#horizonWash)" />

          {/* Month gridlines + labels */}
          {monthMarks.map((mk, i) => (
            <g key={`m-${i}`}>
              <line x1={mk.x} y1={padT - 6} x2={mk.x} y2={H - padB + 6} stroke="#E6EAE5" strokeWidth="1" />
              <text
                x={mk.x}
                y={H - padB + 22}
                textAnchor={i === 0 ? 'start' : 'middle'}
                className="font-mono"
                fontSize="10"
                letterSpacing="1"
                fill="#8A938E"
              >
                {mk.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Zero baseline */}
          <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke="#DDE2DD" strokeWidth="1" strokeDasharray="2 4" />

          {/* Pass 1 — layered area fills (receding hills) */}
          {fillOrder.map((s) => {
            const isHover = hovered === s.key;
            const dim = hovered && !isHover;
            return (
              <path
                key={`fill-${s.key}`}
                d={s.area}
                fill={s.color}
                fillOpacity={isHover ? 0.16 : dim ? 0.02 : 0.06}
                stroke="none"
                pointerEvents="none"
                style={{ transition: 'fill-opacity 0.25s ease' }}
              />
            );
          })}

          {/* Pass 2 — ridgeline strokes + endpoints */}
          {lines.map((s, si) => {
            const isHover = hovered === s.key;
            const dim = hovered && !isHover;
            const end = s.endPt;
            return (
              <g
                key={s.key}
                style={{ opacity: dim ? 0.28 : 1, transition: 'opacity 0.25s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <path
                  d={s.line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isHover ? 3.5 : 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: mounted ? 0 : 1,
                    transition: `stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) ${si * 0.08}s, stroke-width 0.2s ease`,
                  }}
                />
                {/* Endpoint marker + current value */}
                <circle cx={end.x} cy={end.y} r={isHover ? 5 : 3.75} fill={s.color} stroke="#FFFFFF" strokeWidth="1.5" />
                {isHover && (
                  <text x={end.x - 9} y={end.y - 9} textAnchor="end" className="font-mono" fontSize="11" fontWeight="600" fill={s.color}>
                    {s.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Turning-point markers */}
          {turningPoints.map((tp, i) => {
            const idx = dateIndex(tp.occurredAt);
            const x = xAt(idx);
            const domColor = DOMAIN_META[(tp.domainId as string) || '']?.color || '#8A938E';
            const isActive = activeTp === i;
            return (
              <g
                key={tp.id || i}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActiveTp(i)}
                onMouseLeave={() => setActiveTp(null)}
                onClick={() => onSelectTurningPoint?.(tp.id)}
              >
                <line x1={x} y1={padT - 4} x2={x} y2={H - padB} stroke={domColor} strokeWidth="1" strokeOpacity={isActive ? 0.5 : 0.22} strokeDasharray="3 3" />
                <circle cx={x} cy={padT - 12} r="9" fill={isActive ? domColor : '#FFFFFF'} stroke={domColor} strokeWidth="1.5" />
                <text x={x} y={padT - 8.5} textAnchor="middle" className="font-mono" fontSize="10" fontWeight="600" fill={isActive ? '#FFFFFF' : domColor}>
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Now label at right edge */}
          <text x={w - padR} y={padT - 18} textAnchor="end" className="font-mono" fontSize="9" letterSpacing="1.5" fill="#B3B9B2">
            NOW
          </text>
        </svg>

        {/* Turning-point tooltip */}
        {activeTp !== null && turningPoints[activeTp] && (
          <div className="mt-1 px-3.5 py-2.5 bg-[#FFFFFF] border border-[#DDE2DD] rounded-lg shadow-card animate-fade-soft max-w-md">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: DOMAIN_META[(turningPoints[activeTp].domainId as string) || '']?.color,
                  backgroundColor: `${DOMAIN_META[(turningPoints[activeTp].domainId as string) || '']?.color || '#8A938E'}14`,
                }}
              >
                {new Date(turningPoints[activeTp].occurredAt || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[13px] font-semibold text-[#1D2421]">{turningPoints[activeTp].title}</span>
            </div>
            {turningPoints[activeTp].trajectoryShiftSummary && (
              <p className="text-[12px] text-[#66706B] leading-relaxed">{turningPoints[activeTp].trajectoryShiftSummary}</p>
            )}
          </div>
        )}
      </div>

      {/* Legend + explore */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {series.map((s) => (
            <button
              key={s.key}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.key)}
              onBlur={() => setHovered(null)}
              className="flex items-center gap-1.5 group"
              style={{ opacity: hovered && hovered !== s.key ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[12.5px] text-[#66706B] group-hover:text-[#1D2421]">{s.label}</span>
            </button>
          ))}
        </div>

        {onSelectTurningPoint && (
          <button
            onClick={() => onSelectTurningPoint()}
            className="flex items-center gap-1 text-[12.5px] font-semibold text-[#355C4A] hover:gap-1.5 transition-all"
          >
            <span>Read the turning points</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </section>
  );
};
