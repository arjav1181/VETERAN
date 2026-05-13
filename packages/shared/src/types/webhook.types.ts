export interface Webhook {
  id: string;
  repositoryId: string | null;
  organizationId: string | null;
  userId: string | null;
  url: string;
  contentType: 'json' | 'form';
  secret: string | null;
  events: WebhookEventType[];
  isActive: boolean;
  isInsecureSsl: boolean;
  lastDeliveryId: string | null;
  lastDeliveryStatus: string | null;
  lastDeliveryAt: string | null;
  deliveryCount: number;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEventType =
  | 'push'
  | 'pull_request'
  | 'pull_request_review'
  | 'pull_request_review_comment'
  | 'issues'
  | 'issue_comment'
  | 'create'
  | 'delete'
  | 'release'
  | 'fork'
  | 'star'
  | 'watch'
  | 'member'
  | 'team'
  | 'organization'
  | 'repository'
  | 'discussion'
  | 'discussion_comment'
  | 'commit_comment'
  | 'label'
  | 'milestone'
  | 'project'
  | 'project_column'
  | 'project_card'
  | 'check_run'
  | 'check_suite'
  | 'deployment'
  | 'deployment_status'
  | 'package'
  | 'workflow_run'
  | 'workflow_job'
  | 'code_scanning_alert'
  | 'secret_scanning_alert'
  | 'branch_protection_rule'
  | 'merge_group'
  | 'wiki'
  | 'security_advisory'
  | 'sponsorship'
  | 'audit_log'
  | 'ping'
  | '*';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  duration: number;
  status: 'success' | 'failure' | 'timeout';
  attemptedAt: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  eventType: WebhookEventType;
  payload: Record<string, unknown>;
  actorId: string | null;
  actorUsername: string | null;
  repositoryId: string | null;
  organizationId: string | null;
  createdAt: string;
}
