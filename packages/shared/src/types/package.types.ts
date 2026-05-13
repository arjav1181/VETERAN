export interface Package {
  id: string;
  repositoryId: string;
  ownerId: string;
  name: string;
  description: string | null;
  type: PackageType;
  visibility: 'public' | 'private';
  registryUrl: string;
  latestVersion: string;
  downloadCount: number;
  versionCount: number;
  isArchived: boolean;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PackageType =
  | 'container'
  | 'npm'
  | 'maven'
  | 'pypi'
  | 'rubygems'
  | 'nuget'
  | 'docker'
  | 'deb'
  | 'rpm'
  | 'generic';

export interface PackageVersion {
  id: string;
  packageId: string;
  version: string;
  semver: {
    major: number;
    minor: number;
    patch: number;
    prerelease: string | null;
    build: string | null;
  } | null;
  description: string | null;
  license: string | null;
  readme: string | null;
  metadata: Record<string, unknown>;
  size: number;
  downloadCount: number;
  authorId: string;
  authorUsername: string;
  tags: string[];
  isLatest: boolean;
  isPrerelease: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageDownload {
  id: string;
  packageId: string;
  versionId: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  downloadedAt: string;
}

export interface PackageRegistry {
  id: string;
  repositoryId: string;
  type: PackageType;
  url: string;
  isEnabled: boolean;
  upstreamUrl: string | null;
  upstreamUsername: string | null;
  upstreamToken: string | null;
  createdAt: string;
  updatedAt: string;
}
