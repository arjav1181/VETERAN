import { cn } from '@/lib/utils';

interface AvatarStackProps {
  avatars: { src: string | null; alt: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarStack({ avatars, max = 3, size = 'sm', className }: AvatarStackProps) {
  const sizeMap = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn('flex -space-x-1.5', className)}>
      {visible.map((avatar, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full border-2 border-primary-dark overflow-hidden flex-shrink-0',
            sizeMap[size]
          )}
          title={avatar.alt}
        >
          {avatar.src ? (
            <img src={avatar.src} alt={avatar.alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-700 text-white font-medium">
              {getInitials(avatar.alt)}
            </div>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full border-2 border-primary-dark bg-surface flex items-center justify-center text-text-muted font-medium flex-shrink-0',
            sizeMap[size]
          )}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
