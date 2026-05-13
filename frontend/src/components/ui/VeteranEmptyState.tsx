import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { VeteranButton } from './VeteranButton';
import { Inbox, Search, FolderOpen, GitPullRequest, AlertCircle, FileCode } from 'lucide-react';

const iconMap = {
  inbox: Inbox,
  search: Search,
  folder: FolderOpen,
  pull: GitPullRequest,
  alert: AlertCircle,
  code: FileCode,
};

export interface VeteranEmptyStateProps {
  icon?: keyof typeof iconMap | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function VeteranEmptyState({ icon = 'inbox', title, description, action, secondaryAction, className }: VeteranEmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : null;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-surface-400" />
        ) : (
          <span className="text-surface-400">{icon}</span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-[rgb(var(--veteran-fg))] mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-surface-500 max-w-md mb-6">
          {description}
        </p>
      )}

      {!description && <div className="mb-6" />}

      {action && (
        <VeteranButton onClick={action.onClick} size="md">
          {action.label}
        </VeteranButton>
      )}

      {secondaryAction && (
        <div className="mt-2">
          <VeteranButton onClick={secondaryAction.onClick} variant="ghost" size="sm">
            {secondaryAction.label}
          </VeteranButton>
        </div>
      )}
    </div>
  );
}
