import { useMemo, useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { format, eachDayOfInterval, subDays, startOfWeek, getDay, differenceInDays } from 'date-fns';

export interface VeteranContribGraphProps {
  data: Record<string, number>;
  className?: string;
  colorScheme?: 'green' | 'veteran' | 'gold';
}

const colorSchemes = {
  green: ['bg-surface-100 dark:bg-surface-800', 'bg-green-200 dark:bg-green-900', 'bg-green-400 dark:bg-green-700', 'bg-green-600 dark:bg-green-500', 'bg-green-800 dark:bg-green-400'],
  veteran: ['bg-surface-100 dark:bg-surface-800', 'bg-veteran-200 dark:bg-veteran-900', 'bg-veteran-400 dark:bg-veteran-700', 'bg-veteran-600 dark:bg-veteran-500', 'bg-veteran-800 dark:bg-veteran-400'],
  gold: ['bg-surface-100 dark:bg-surface-800', 'bg-brand-200 dark:bg-brand-900', 'bg-brand-400 dark:bg-brand-700', 'bg-brand-600 dark:bg-brand-500', 'bg-brand-800 dark:bg-brand-400'],
};

function getLevel(count: number, max: number): number {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function VeteranContribGraph({ data, className, colorScheme = 'green' }: VeteranContribGraphProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { weeks, maxCount, totalCount } = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(subDays(today, 363), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: today });
    const formatted = days.map((d) => format(d, 'yyyy-MM-dd'));

    const byWeek: string[][] = [];
    let currentWeek: string[] = [];
    formatted.forEach((day, i) => {
      const dayOfWeek = getDay(new Date(day));
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        byWeek.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) byWeek.push(currentWeek);

    const counts = formatted.map((d) => data[d] || 0);
    const max = Math.max(...counts, 1);
    const total = counts.reduce((a, b) => a + b, 0);

    return { weeks: byWeek, maxCount: max, totalCount: total };
  }, [data]);

  const colors = colorSchemes[colorScheme];

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      <div className="flex items-center justify-between text-xs text-surface-500">
        <span>{totalCount.toLocaleString()} contributions in the last year</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {colors.map((color, i) => (
            <div key={i} className={cn('w-3 h-3 rounded-sm', color)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day) => {
                const count = data[day] || 0;
                const level = getLevel(count, maxCount);

                return (
                  <div
                    key={day}
                    className={cn(
                      'w-3 h-3 rounded-sm cursor-pointer transition-colors',
                      colors[level]
                    )}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        date: day,
                        count,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      });
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
          className="fixed z-50 px-2.5 py-1.5 rounded-md bg-surface-800 dark:bg-surface-200 text-surface-100 dark:text-surface-800 text-xs shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <strong>{tooltip.count.toLocaleString()}</strong> contribution{tooltip.count !== 1 ? 's' : ''} on {format(new Date(tooltip.date), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
