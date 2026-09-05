import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Reflection } from '../types';

interface RecentReflectionsProps {
  onViewAll?: () => void;
}

const relativeDate = (iso?: string): string => {
  if (!iso) return '';
  const then = new Date(iso);
  if (isNaN(then.getTime())) return '';
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const snippetOf = (content?: string): string => {
  const clean = (content || '').replace(/[*_`#>]+/g, '').replace(/\s{2,}/g, ' ').trim();
  return clean.length > 138 ? `${clean.slice(0, 138).trimEnd()}…` : clean;
};

export const RecentReflections: React.FC<RecentReflectionsProps> = ({ onViewAll }) => {
  const [reflections, setReflections] = useState<Reflection[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .getReflections()
      .then((res) => {
        if (!alive) return;
        const sorted = (res.reflections || [])
          .slice()
          .sort(
            (a, b) =>
              new Date(b.occurredAt || b.createdAt || 0).getTime() -
              new Date(a.occurredAt || a.createdAt || 0).getTime()
          );
        // Deduplicate entries by normalized content snippet so repeated test reflections don't duplicate
        const unique: Reflection[] = [];
        const seen = new Set<string>();
        for (const r of sorted) {
          const key = (r.rawContent || r.content || '').trim().slice(0, 80).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
          }
        }
        setReflections(unique);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const items = (reflections || []).slice(0, 4);

  return (
    <section className="card bg-[#FFFFFF] border border-[#DDE2DD] p-6" aria-label="Recent reflections">
      <div className="flex items-center justify-between mb-4">
        <span className="editorial-eyebrow">Recent reflections</span>
        {reflections && reflections.length > 0 && (
          <button
            onClick={onViewAll}
            className="group inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#355C4A] hover:gap-1.5 transition-all"
          >
            <span>Read the journal</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Loading */}
      {!reflections && !error && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-20 bg-[#EEEEE8] rounded" />
              <div className="h-3 w-full bg-[#F2F1EB] rounded" />
              <div className="h-3 w-2/3 bg-[#F2F1EB] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty / error */}
      {((reflections && reflections.length === 0) || error) && (
        <p className="text-[13.5px] text-[#66706B] leading-relaxed py-2">
          Nothing recorded yet. Your first reflection will appear here — and begin shaping the horizon above.
        </p>
      )}

      {/* Real reflections */}
      {items.length > 0 && (
        <ul className="divide-y divide-[#EDECE6] -my-1">
          {items.map((r) => (
            <li key={r.id}>
              <button
                onClick={onViewAll}
                className="w-full text-left py-3.5 group"
              >
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#8A938E] mb-1.5">
                  {relativeDate(r.occurredAt || r.createdAt)}
                </p>
                <p className="text-[13.5px] text-[#4F5A55] leading-relaxed line-clamp-2 group-hover:text-[#1D2421] transition-colors">
                  {snippetOf(r.content)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
