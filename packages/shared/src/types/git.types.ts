export interface GitRef {
  id: string;
  repositoryId: string;
  ref: string;
  sha: string;
  type: 'branch' | 'tag' | 'other';
  name: string;
  targetSha: string;
  targetType: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitCommit {
  sha: string;
  shortSha: string;
  message: string;
  messageHeadline: string;
  messageBody: string | null;
  author: GitActor;
  committer: GitActor;
  parents: string[];
  treeSha: string;
  verification: GitVerification | null;
  signatures: GitSignature[];
  additions: number;
  deletions: number;
  totalChanges: number;
  fileCount: number;
  files: GitFile[];
  authoredAt: string;
  committedAt: string;
}

export interface GitActor {
  name: string;
  email: string;
  date: string;
  username: string | null;
  avatarUrl: string | null;
  userId: string | null;
}

export interface GitVerification {
  verified: boolean;
  reason: string;
  signature: string | null;
  payload: string | null;
  signer: string | null;
  identity: string | null;
}

export interface GitSignature {
  type: 'gpg' | 'ssh' | 'x509';
  keyId: string;
  signer: string;
  isVerified: boolean;
}

export interface GitTree {
  sha: string;
  url: string;
  entries: GitTreeEntry[];
  truncated: boolean;
  size: number;
}

export interface GitTreeEntry {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size: number | null;
  url: string;
}

export interface GitBlob {
  sha: string;
  content: string;
  encoding: 'base64' | 'utf-8';
  size: number;
  url: string;
  truncated: boolean;
}

export interface GitDiff {
  sha: string;
  oldSha: string;
  newSha: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'unchanged';
  similarity: number;
  files: GitDiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
}

export interface GitDiffFile {
  oldPath: string;
  newPath: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  similarity: number;
  isBinary: boolean;
  diff: string | null;
  patch: string | null;
  hunks: GitDiffHunk[];
  previousFilename: string | null;
}

export interface GitDiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitDiffLine[];
}

export interface GitDiffLine {
  type: 'added' | 'deleted' | 'context' | 'eof';
  oldLineNumber: number | null;
  newLineNumber: number | null;
  content: string;
}

export interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  previousPath: string | null;
}

export interface GitMergeBase {
  sha: string;
  commit: GitCommit;
  commonAncestors: string[];
}

export interface GitRebaseStatus {
  inProgress: boolean;
  currentStep: number;
  totalSteps: number;
  currentCommit: string | null;
  steps: GitRebaseStep[];
}

export interface GitRebaseStep {
  operation: 'pick' | 'reword' | 'edit' | 'squash' | 'fixup' | 'exec' | 'drop';
  commitSha: string;
  commitMessage: string;
  done: boolean;
}
