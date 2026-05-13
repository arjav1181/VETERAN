import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface VeteranInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showCharCount?: boolean;
  maxLength?: number;
}

export const VeteranInput = forwardRef<HTMLInputElement, VeteranInputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, showCharCount, maxLength, type, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            className={cn(
              'w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-[rgb(var(--veteran-bg))] px-3 py-2.5 text-sm text-[rgb(var(--veteran-fg))] placeholder-surface-400 dark:placeholder-surface-500 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-veteran-500/50 focus:border-veteran-500',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-50 dark:disabled:bg-surface-800',
              error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              className
            )}
            {...props}
          />

          {(rightIcon || isPassword) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {error && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-500">{error}</span>
              </>
            )}
            {!error && helperText && (
              <span className="text-xs text-surface-500">{helperText}</span>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className={cn('text-xs text-surface-400', charCount >= maxLength && 'text-red-500')}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

VeteranInput.displayName = 'VeteranInput';
