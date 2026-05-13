import type { Permission, Visibility } from './common.types';

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  email: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  defaultRepoPermission: Permission;
  memberCount: number;
  teamCount: number;
  repoCount: number;
  plan: 'free' | 'team' | 'enterprise';
  billingEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  organizationId: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: 'owner' | 'admin' | 'member';
  isPending: boolean;
  teams: string[];
  invitedAt: string;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  visibility: Visibility;
  memberCount: number;
  repoCount: number;
  parentTeamId: string | null;
  parentTeamName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: 'maintainer' | 'member';
  isPending: boolean;
  invitedAt: string;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRepo {
  id: string;
  teamId: string;
  repositoryId: string;
  repositoryName: string;
  repositoryFullName: string;
  permission: Permission;
  createdAt: string;
}
