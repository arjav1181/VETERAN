import type { Permission } from '@/types';
import { useMemo } from 'react';

interface PermissionGateProps {
  requiredPermission: Permission;
  userPermission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PERMISSION_HIERARCHY: Record<Permission, number> = {
  read: 0,
  triage: 1,
  write: 2,
  maintain: 3,
  admin: 4,
};

export function PermissionGate({
  requiredPermission,
  userPermission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = useMemo(() => {
    if (!userPermission) return false;
    return PERMISSION_HIERARCHY[userPermission] >= PERMISSION_HIERARCHY[requiredPermission];
  }, [requiredPermission, userPermission]);

  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}
