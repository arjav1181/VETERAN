import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-veteran-600 text-white hover:bg-veteran-700 active:bg-veteran-800 shadow-sm',
        secondary: 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 border border-surface-300 dark:border-surface-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
        ghost: 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
        outline: 'border-2 border-veteran-600 text-veteran-600 hover:bg-veteran-50 dark:hover:bg-veteran-950 dark:text-veteran-400 dark:border-veteran-400',
        gold: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface VeteranButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

export const VeteranButton = forwardRef<HTMLButtonElement, VeteranButtonProps>(
  ({ className, variant, size, fullWidth, loading, disabled, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

VeteranButton.displayName = 'VeteranButton';
