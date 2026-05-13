import { type HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        veteran: 'bg-veteran-100 dark:bg-veteran-900/30 text-veteran-700 dark:text-veteran-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      dot: {
        true: 'before:content-[""] before:inline-block before:w-1.5 before:h-1.5 before:rounded-full',
      },
    },
    compoundVariants: [
      { variant: 'default', dot: true, className: 'before:bg-surface-400 dark:before:bg-surface-500' },
      { variant: 'success', dot: true, className: 'before:bg-green-500' },
      { variant: 'danger', dot: true, className: 'before:bg-red-500' },
      { variant: 'warning', dot: true, className: 'before:bg-amber-500' },
      { variant: 'info', dot: true, className: 'before:bg-blue-500' },
      { variant: 'veteran', dot: true, className: 'before:bg-veteran-500' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface VeteranBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const VeteranBadge = forwardRef<HTMLSpanElement, VeteranBadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size, dot, className }))} {...props}>
        {children}
      </span>
    );
  }
);

VeteranBadge.displayName = 'VeteranBadge';
