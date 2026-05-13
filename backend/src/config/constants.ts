export const APP_NAME = "VETERAN";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "VETERAN Git Platform";

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const GIT_PROTOCOL = "smart";
export const GIT_USER_AGENT = "VETERAN-Git/1.0.0";

export const PAGINATION_DEFAULT_PER_PAGE = 30;
export const PAGINATION_MAX_PER_PAGE = 100;

export const TOKEN_BYTES = 32;
export const TOKEN_ENCODING = "hex" as const;
export const REFRESH_TOKEN_BYTES = 48;
export const API_TOKEN_BYTES = 40;

export const BCRYPT_ROUNDS = 12;

export const DEFAULT_AVATAR = "/avatars/default.png";
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_ARCHIVE_SIZE = 500 * 1024 * 1024;

export const LFS_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
export const LFS_BATCH_SIZE = 100;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
} as const;

export const ISSUE_STATES = ["open", "closed"] as const;
export const PR_STATES = ["open", "closed", "merged"] as const;
export const MERGE_METHODS = ["merge", "squash", "rebase"] as const;
export const REVIEW_STATES = ["approved", "changes_requested", "commented", "dismissed", "pending"] as const;
export const COLLABORATOR_PERMISSIONS = ["pull", "push", "triage", "maintain", "admin"] as const;

export const DEFAULT_LABELS = [
  { name: "bug", color: "d73a4a", description: "Something isn't working" },
  { name: "documentation", color: "0075ca", description: "Improvements or additions to documentation" },
  { name: "duplicate", color: "cfd3d7", description: "This issue or pull request already exists" },
  { name: "enhancement", color: "a2eeef", description: "New feature or request" },
  { name: "good first issue", color: "7057ff", description: "Good for newcomers" },
  { name: "help wanted", color: "008672", description: "Extra attention is needed" },
  { name: "invalid", color: "e4e669", description: "This doesn't seem right" },
  { name: "question", color: "d876e3", description: "Further information is requested" },
  { name: "wontfix", color: "ffffff", description: "This will not be worked on" },
];

export const WEBHOOK_EVENTS = [
  "push", "pull_request", "issues", "issue_comment",
  "create", "delete", "release", "watch", "star",
  "fork", "member", "team", "organization",
  "repository", "deployment", "deployment_status",
  "check_run", "check_suite", "commit_comment",
  "discussion", "discussion_comment", "wiki",
  "package", "workflow_run", "workflow_job",
  "codespace", "project", "project_card", "project_column",
  "label", "milestone", "page_build", "ping",
] as const;

export const CI_STATUSES = ["pending", "running", "passed", "failed", "cancelled", "skipped"] as const;

export const CODESPACE_MACHINES = [
  { type: "basic", cpu: 2, memory: "4GB", storage: "32GB" },
  { type: "standard", cpu: 4, memory: "8GB", storage: "64GB" },
  { type: "premium", cpu: 8, memory: "16GB", storage: "128GB" },
] as const;

export const PACKAGE_TYPES = ["npm", "docker", "maven", "pypi", "rubygems", "container"] as const;

export const ORG_ROLES = ["owner", "admin", "member", "billing"] as const;

export const NOTIFICATION_TYPES = [
  "issue", "pull_request", "release", "discussion",
  "security_alert", "ci", "mention", "review",
] as const;

export const DEFAULT_PAGE_SIZE = 30;
export const MAX_PAGE_SIZE = 100;
