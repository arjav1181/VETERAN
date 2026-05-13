import { type HTMLAttributes, forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, initials } from '../../lib/utils';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 font-semibold select-none',
  {
    variants: {
      size: {
        xs: 'w-5 h-5 text-2xs',
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-24 h-24 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type StatusDot = 'online' | 'offline' | 'busy' | 'away';

const statusColors: Record<StatusDot, string> = {
  online: 'bg-green-500',
  offline: 'bg-surface-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

export interface VeteranAvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name?: string;
  status?: StatusDot;
  fallback?: string;
}

export const VeteranAvatar = forwardRef<HTMLDivElement, VeteranAvatarProps>(
  ({ className, size, src, alt, name, status, fallback, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;
    const initialsStr = fallback || (name ? initials(name) : '?');

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        <div className={cn(avatarVariants({ size }), 'bg-surface-200 dark:bg-surface-700')}>
          {showImage ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-surface-600 dark:text-surface-400">{initialsStr}</span>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[rgb(var(--veteran-bg))]',
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

VeteranAvatar.displayName = 'VeteranAvatar';

export interface VeteranAvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string }>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  limit?: number;
  className?: string;
}

export function VeteranAvatarGroup({ avatars, size = 'md', limit = 4, className }: VeteranAvatarGroupProps) {
  const visible = avatars.slice(0, limit);
  const remaining = avatars.length - limit;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, i) => (
        <VeteranAvatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-[rgb(var(--veteran-bg))]"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'ring-2 ring-[rgb(var(--veteran-bg))] bg-surface-200 dark:bg-surface-700 text-xs font-medium text-surface-600 dark:text-surface-400'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
