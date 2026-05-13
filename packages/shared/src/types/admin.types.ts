export interface AdminSettings {
  id: string;
  platformName: string;
  platformUrl: string;
  platformEmail: string;
  allowRegistrations: boolean;
  allowPasswordAuth: boolean;
  allowOAuth: boolean;
  requireEmailVerification: boolean;
  requireTwoFactor: boolean;
  defaultRepoVisibility: 'public' | 'private';
  defaultUserRole: 'user' | 'admin';
  maxReposPerUser: number;
  maxOrgsPerUser: number;
  maxTeamSize: number;
  maxUploadSize: number;
  maxFileSize: number;
  allowedFileExtensions: string | null;
  blockedFileExtensions: string[];
  allowedDomains: string[];
  blockedDomains: string[];
  sessionTimeout: number;
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  termsOfServiceUrl: string | null;
  privacyPolicyUrl: string | null;
  customCss: string | null;
  customJs: string | null;
  registrationMessage: string | null;
  signInMessage: string | null;
  updatedAt: string;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  body: string;
  bodyHtml: string | null;
  severity: 'info' | 'warning' | 'danger' | 'success';
  isActive: boolean;
  isDismissible: boolean;
  expiresAt: string | null;
  createdById: string;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorUsername: string;
  actorIpAddress: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string | null;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  occurredAt: string;
  createdAt: string;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  labels: Record<string, string>;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  database: { status: string; latency: number };
  redis: { status: string; latency: number } | null;
  storage: { status: string; used: number; available: number };
  queue: { status: string; pending: number; processing: number };
  lastCheckedAt: string;
}
