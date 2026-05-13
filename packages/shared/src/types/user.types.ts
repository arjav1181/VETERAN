export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  pronouns: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  company: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  isAvailableForHire: boolean;
  sponsorUrl: string | null;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'mastodon' | 'youtube' | 'twitch' | 'bluesky' | 'website';
  url: string;
}

export type UserRole = 'admin' | 'user';
export type UserVisibility = 'public' | 'private';

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'google' | 'microsoft' | 'discord';
  providerAccountId: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SSHKey {
  id: string;
  userId: string;
  title: string;
  publicKey: string;
  fingerprint: string;
  keyType: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isReadOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiToken {
  id: string;
  userId: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  pronouns: string | null;
  displayEmail: string | null;
  isAvailableForHire: boolean;
  pinnedRepositories: string[];
  contributions: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
  tabSize: number;
  editorFontSize: number;
  editorFontFamily: string;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  editorLineNumbers: 'on' | 'off' | 'relative';
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | null;
  preferredGitProtocol: 'ssh' | 'https';
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailPreference {
  id: string;
  userId: string;
  type: 'notification' | 'digest' | 'marketing' | 'security';
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}
