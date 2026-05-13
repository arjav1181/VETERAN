import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContribGraphProps {
  contributions: ContributionDay[];
  className?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-surface-800/30 hover:bg-surface-800/50',
  1: 'bg-success/20 hover:bg-success/30',
  2: 'bg-success/40 hover:bg-success/50',
  3: 'bg-success/60 hover:bg-success/70',
  4: 'bg-success/80 hover:bg-success/90',
};

export function ContribGraph({ contributions, className }: ContribGraphProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const weeks = useMemo(() => {
    const days: (ContributionDay | null)[] = [];
    if (contributions.length === 0) {
      const today = new Date();
      for (let i = 0; i < 364; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (364 - i));
        days.push({ date: d.toISOString().split('T')[0], count: 0, level: 0 });
      }
    } else {
      contributions.forEach(c => days.push(c));
    }
    const result: (ContributionDay | null)[][] = [];
    const startDay = new Date(days[0]?.date || new Date()).getDay();
    for (let i = 0; i < startDay; i++) result.push([]);

    let week: (ContributionDay | null)[] = [];
    days.forEach(day => {
      week.push(day);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });
    if (week.length > 0) result.push(week);
    return result;
  }, [contributions]);

  const totalContributions = useMemo(
    () => contributions.reduce((sum, c) => sum + c.count, 0),
    [contributions]
  );

  return (
    <div className={cn('bg-primary-dark border border-border rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary">{totalContributions.toLocaleString()} contributions in the last year</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={cn('w-3 h-3 rounded-sm', LEVEL_COLORS[level])} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-0.5" style={{ minWidth: '700px' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week[di] || null;
                return (
                  <div
                    key={di}
                    className={cn(
                      'w-3 h-3 rounded-sm transition-colors relative',
                      day ? LEVEL_COLORS[day.level] : 'bg-transparent'
                    )}
                    onMouseEnter={(e) => {
                      if (day) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top - 40 });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg shadow-xl px-3 py-1.5 text-sm pointer-events-none animate-fade-in"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-medium text-text-primary">{tooltip.count} contributions</span>
          <span className="text-text-muted ml-1">on {tooltip.date}</span>
        </div>
      )}
    </div>
  );
}
