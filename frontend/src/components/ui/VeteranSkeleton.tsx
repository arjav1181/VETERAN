import { cn } from '../../lib/utils';

export interface VeteranSkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'table' | 'code' | 'button';
}

export function VeteranSkeleton({ className, variant = 'text' }: VeteranSkeletonProps) {
  const base = 'animate-pulse rounded bg-surface-200 dark:bg-surface-700';

  switch (variant) {
    case 'avatar':
      return <div className={cn(base, 'rounded-full w-10 h-10', className)} />;
    case 'card':
      return (
        <div className={cn('space-y-3 p-4 border border-surface-200 dark:border-surface-700 rounded-lg', className)}>
          <div className={cn(base, 'h-4 w-3/4')} />
          <div className={cn(base, 'h-3 w-full')} />
          <div className={cn(base, 'h-3 w-5/6')} />
          <div className="flex gap-2 pt-2">
            <div className={cn(base, 'h-8 w-20 rounded-md')} />
            <div className={cn(base, 'h-8 w-20 rounded-md')} />
          </div>
        </div>
      );
    case 'table':
      return (
        <div className={cn('space-y-3', className)}>
          <div className="flex gap-4">
            <div className={cn(base, 'h-4 w-1/4')} />
            <div className={cn(base, 'h-4 w-1/4')} />
            <div className={cn(base, 'h-4 w-1/4')} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className={cn(base, 'h-3 w-1/4')} />
              <div className={cn(base, 'h-3 w-1/4')} />
              <div className={cn(base, 'h-3 w-1/4')} />
            </div>
          ))}
        </div>
      );
    case 'code':
      return (
        <div className={cn('space-y-2 p-4 border border-surface-200 dark:border-surface-700 rounded-lg', className)}>
          <div className="flex gap-4">
            <div className={cn(base, 'h-3 w-8')} />
            <div className={cn(base, 'h-3 w-3/4')} />
          </div>
          <div className="flex gap-4">
            <div className={cn(base, 'h-3 w-8')} />
            <div className={cn(base, 'h-3 w-2/3')} />
          </div>
          <div className="flex gap-4">
            <div className={cn(base, 'h-3 w-8')} />
            <div className={cn(base, 'h-3 w-5/6')} />
          </div>
          <div className="flex gap-4">
            <div className={cn(base, 'h-3 w-8')} />
            <div className={cn(base, 'h-3 w-1/2')} />
          </div>
        </div>
      );
    case 'button':
      return <div className={cn(base, 'h-10 w-24 rounded-lg', className)} />;
    default:
      return <div className={cn(base, 'h-4 w-full', className)} />;
  }
}

export function VeteranSkeletonGroup({ count = 3, variant = 'text' }: { count?: number; variant?: VeteranSkeletonProps['variant'] }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <VeteranSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
