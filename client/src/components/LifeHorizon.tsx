import React, { useState } from 'react';
import { 
  DomainId, 
  LifeSnapshot, 
  DOMAIN_CONFIGS, 
  TurningPoint,
  TrendDirection
} from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle, Layers, Activity } from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';

interface LifeHorizonProps {
  snapshot: LifeSnapshot | null;
  onSelectTurningPoint?: (tp: TurningPoint) => void;
}

export const LifeHorizon: React.FC<LifeHorizonProps> = ({ snapshot, onSelectTurningPoint }) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainId | 'all'>('all');
  const [selectedEvidenceData, setSelectedEvidenceData] = useState<{
    title: string;
    explanation: string;
    evidence: any[];
    confidence: string;
  } | null>(null);

  if (!snapshot) {
    return (
      <div className="card text-center p-12 text-slate-400">
        <Activity className="animate-spin mx-auto mb-3 text-indigo-400" size={28} />
        <p>Loading Life Horizon trajectories...</p>
      </div>
    );
  }

  const domains = Object.keys(snapshot.domainStates) as DomainId[];
  const activeDomains = selectedDomain === 'all' 
    ? domains 
    : domains.filter(d => d === selectedDomain);

  // Time labels from the first domain's trajectory points
  const timePoints = snapshot.domainStates[domains[0]]?.points || [];

  const getDirectionBadge = (dir: TrendDirection) => {
    switch (dir) {
      case 'sustained_up':
      case 'up':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34D399' }}>
            <ArrowUpRight size={14} /> {dir === 'sustained_up' ? 'Sustained Up' : 'Upward'}
          </span>
        );
      case 'sustained_down':
      case 'down':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: '#F87171' }}>
            <ArrowDownRight size={14} /> {dir === 'sustained_down' ? 'Declining' : 'Downward'}
          </span>
        );
      case 'emerging':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
            Emerging
          </span>
        );
      case 'mixed':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}>
            Mixed
          </span>
        );
      case 'insufficient_evidence':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8' }}>
            Sparse Evidence
          </span>
        );
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8' }}>
            <Minus size={14} /> Stable
          </span>
        );
    }
  };

  /**
   * Helper to build SVG curve from trajectory points
   */
  const renderSvgPath = (points: Array<{ date: string; value: number }>, color: string, isSparse: boolean) => {
    if (points.length < 2) return null;

    const width = 800;
    const height = 64;
    const stepX = width / (points.length - 1);

    // Points map: y=32 is baseline 0. -1.0 maps to y=56, +1.0 maps to y=8
    const coords = points.map((p, idx) => {
      const x = idx * stepX;
      const normalizedY = 32 - p.value * 24;
      return { x, y: normalizedY };
    });

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return (
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-16 overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Baseline indicator */}
        <line 
          x1="0" 
          y1="32" 
          x2={width} 
          y2="32" 
          stroke="#334155" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
        />
        
        {/* Trajectory curve */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={isSparse ? "6 6" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 2px 8px ${color}40)`,
            transition: 'all 0.4s ease',
          }}
        />

        {/* Highlight latest point */}
        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r="4.5"
          fill={color}
          stroke="#0B0F19"
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <div className="card mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Life Horizon</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aligned longitudinal trajectories over a common time axis ({snapshot.period.from} → {snapshot.period.to})
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedDomain === 'all' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All Domains
          </button>
          {domains.map(dom => {
            const cfg = DOMAIN_CONFIGS[dom];
            if (!cfg) return null;
            return (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedDomain === dom 
                    ? 'text-white shadow-md' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                style={selectedDomain === dom ? { backgroundColor: cfg.color } : {}}
              >
                {cfg.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Summary for WCAG AA */}
      <div className="sr-only">
        {domains.map(d => {
          const s = snapshot.domainStates[d];
          return `${DOMAIN_CONFIGS[d]?.name}: ${s?.direction}, ${s?.summary}. `;
        }).join(' ')}
      </div>

      {/* Trajectories Table / Canvas */}
      <div className="space-y-6">
        {activeDomains.map(dom => {
          const cfg = DOMAIN_CONFIGS[dom];
          const state = snapshot.domainStates[dom];
          if (!state) return null;

          const isSparse = state.confidence === 'insufficient_evidence' || state.confidence === 'low';

          return (
            <div 
              key={dom} 
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cfg?.color || '#818CF8' }} 
                  />
                  <span className="font-semibold text-sm text-slate-200">
                    {cfg?.name || dom}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({state.eventCount} observations)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {getDirectionBadge(state.direction)}
                  <button
                    onClick={() => setSelectedEvidenceData({
                      title: `${cfg?.name} Trajectory Evidence`,
                      explanation: state.summary,
                      evidence: [],
                      confidence: state.confidence,
                    })}
                    className="text-slate-400 hover:text-white p-1 rounded transition"
                    aria-label={`Inspect evidence for ${cfg?.name}`}
                  >
                    <HelpCircle size={15} />
                  </button>
                </div>
              </div>

              {/* Trajectory Canvas Curve */}
              <div className="px-2 py-1">
                {renderSvgPath(state.points, cfg?.color || '#818CF8', isSparse)}
              </div>

              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>{state.summary}</span>
                {isSparse && (
                  <span className="italic text-slate-400">Dashed line indicates emerging or sparse evidence</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Common Time Axis Axis Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-500 px-4">
        {timePoints.filter((_, idx) => idx % 2 === 0).map((pt, i) => (
          <span key={i}>{pt.date}</span>
        ))}
      </div>

      {/* Turning Points Along Horizon */}
      {snapshot.turningPoints.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Inflection & Turning Points in this Window
            </h3>
            <span className="text-xs text-slate-500">
              {snapshot.turningPoints.length} detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {snapshot.turningPoints.map(tp => (
              <div
                key={tp.id}
                onClick={() => onSelectTurningPoint && onSelectTurningPoint(tp)}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-indigo-500/50 cursor-pointer transition flex items-start gap-2.5"
              >
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{tp.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{tp.description}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(tp.occurredAt).toLocaleDateString()} • {tp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEvidenceData && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setSelectedEvidenceData(null)}
          title={selectedEvidenceData.title}
          explanation={selectedEvidenceData.explanation}
          evidence={selectedEvidenceData.evidence}
          confidence={selectedEvidenceData.confidence}
        />
      )}
    </div>
  );
};
