export interface SecurityAdvisory {
  id: string;
  repositoryId: string;
  ghsaId: string;
  cveId: string | null;
  summary: string;
  description: string;
  descriptionHtml: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number | null;
  cvssVector: string | null;
  cwes: string[];
  state: 'draft' | 'published' | 'withdrawn' | 'closed';
  publishedAt: string | null;
  withdrawnAt: string | null;
  closedAt: string | null;
  vulnerabilities: SecurityVulnerability[];
  references: SecurityAdvisoryReference[];
  credits: SecurityAdvisoryCredit[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityVulnerability {
  id: string;
  advisoryId: string;
  packageName: string;
  packageEcosystem: string;
  affectedRange: string;
  fixedIn: string | null;
  patchedVersions: string[];
  vulnerableVersions: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAdvisoryReference {
  id: string;
  advisoryId: string;
  url: string;
  type: 'advisory' | 'article' | 'fix' | 'package' | 'report' | 'web';
}

export interface SecurityAdvisoryCredit {
  id: string;
  advisoryId: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  type: 'finder' | 'reporter' | 'analyst' | 'coordinator' | 'remediation_developer';
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  repositoryId: string;
  type: 'dependabot' | 'code_scanning' | 'secret_scanning' | 'advisory';
  state: 'open' | 'dismissed' | 'fixed';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'note';
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  packageName: string | null;
  packageEcosystem: string | null;
  affectedRange: string | null;
  fixedIn: string | null;
  dismissReason: string | null;
  dismissedById: string | null;
  dismissedByUsername: string | null;
  dismissedAt: string | null;
  fixedAt: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecretScanningAlert {
  id: string;
  repositoryId: string;
  secretType: string;
  secretDisplayType: string;
  secretName: string | null;
  location: string;
  locationType: 'commit' | 'issue_comment' | 'discussion_comment' | 'wiki';
  commitSha: string | null;
  commitMessage: string | null;
  authorUsername: string | null;
  state: 'open' | 'resolved' | 'unresolved';
  resolution: 'false_positive' | 'used_in_tests' | 'revoked' | 'fixed' | null;
  resolvedById: string | null;
  resolvedByUsername: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CodeScanningAlert {
  id: string;
  repositoryId: string;
  number: number;
  ruleId: string;
  ruleDescription: string;
  ruleSeverity: 'error' | 'warning' | 'note' | 'none';
  toolName: string;
  category: string | null;
  path: string;
  startLine: number;
  endLine: number;
  startColumn: number | null;
  endColumn: number | null;
  className: string | null;
  methodName: string | null;
  message: string;
  messageHtml: string | null;
  state: 'open' | 'dismissed' | 'fixed';
  dismissedReason: string | null;
  dismissedById: string | null;
  dismissedByUsername: string | null;
  dismissedAt: string | null;
  fixedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DependabotAlert {
  id: string;
  repositoryId: string;
  number: number;
  dependencyName: string;
  dependencyEcosystem: string;
  dependencyManifestPath: string;
  dependencyScope: 'development' | 'runtime';
  estimatedUpgradeCost: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number | null;
  cvssVector: string | null;
  cveId: string | null;
  ghsaId: string;
  summary: string;
  description: string | null;
  fixedInVersion: string | null;
  patchedVersions: string[];
  vulnerableVersions: string[];
  state: 'open' | 'dismissed' | 'fixed';
  dismissReason: string | null;
  dismissedById: string | null;
  dismissedByUsername: string | null;
  dismissedAt: string | null;
  fixedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
