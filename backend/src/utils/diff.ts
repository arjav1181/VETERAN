import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface DiffFile {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed" | "copied";
  additions: number;
  deletions: number;
  diff?: string;
  oldPath?: string;
  newPath?: string;
}

export interface UnifiedDiff {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalFiles: number;
}

export function getCommitDiff(repoPath: string, commitSha: string): UnifiedDiff {
  const result = execSync(
    `git diff ${commitSha}^..${commitSha} --numstat`,
    { cwd: repoPath, encoding: "utf-8" }
  );

  const lines = result.trim().split("\n").filter(Boolean);
  const files: DiffFile[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const line of lines) {
    const [additions, deletions, path] = line.split("\t");
    const a = parseInt(additions) || 0;
    const d = parseInt(deletions) || 0;
    totalAdditions += a;
    totalDeletions += d;

    const status = a === 0 && d === 0 ? "modified" : "modified";
    files.push({ path, status, additions: a, deletions: d });
  }

  return { files, totalAdditions, totalDeletions, totalFiles: files.length };
}

export function getBranchDiff(repoPath: string, baseBranch: string, headBranch: string): UnifiedDiff {
  const result = execSync(
    `git diff ${baseBranch}..${headBranch} --numstat`,
    { cwd: repoPath, encoding: "utf-8" }
  );

  const lines = result.trim().split("\n").filter(Boolean);
  const files: DiffFile[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const line of lines) {
    const [additions, deletions, path] = line.split("\t");
    const a = parseInt(additions) || 0;
    const d = parseInt(deletions) || 0;
    totalAdditions += a;
    totalDeletions += d;
    files.push({ path, status: "modified", additions: a, deletions: d });
  }

  return { files, totalAdditions, totalDeletions, totalFiles: files.length };
}

export function getUnifiedDiff(repoPath: string, args: string[]): string {
  return execSync(
    `git diff ${args.join(" ")}`,
    { cwd: repoPath, encoding: "utf-8" }
  );
}

export function getFilePatch(repoPath: string, commitSha: string, filePath: string): string {
  return execSync(
    `git show ${commitSha} -- "${filePath}"`,
    { cwd: repoPath, encoding: "utf-8" }
  );
}

export function parseDiffStat(diffOutput: string): DiffFile[] {
  if (!diffOutput) return [];

  const lines = diffOutput.trim().split("\n").filter(Boolean);
  const files: DiffFile[] = [];

  for (const line of lines) {
    const [additions, deletions, path] = line.split("\t");
    if (!path) continue;
    const a = parseInt(additions) || 0;
    const d = parseInt(deletions) || 0;
    files.push({
      path,
      status: a > 0 && d > 0 ? "modified" : a > 0 ? "added" : "deleted",
      additions: a,
      deletions: d,
    });
  }

  return files;
}

export function getDiffStats(repoPath: string, commitSha: string): { additions: number; deletions: number; fileCount: number } {
  try {
    const result = execSync(
      `git diff --shortstat ${commitSha}^..${commitSha}`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    if (!result) return { additions: 0, deletions: 0, fileCount: 0 };

    const parts = result.trim().split(", ");
    const fileCount = parseInt(parts[0]) || 0;
    const additionsMatch = result.match(/(\d+) insertion/);
    const deletionsMatch = result.match(/(\d+) deletion/);
    const additions = additionsMatch ? parseInt(additionsMatch[1]) : 0;
    const deletions = deletionsMatch ? parseInt(deletionsMatch[1]) : 0;

    return { additions, deletions, fileCount };
  } catch {
    return { additions: 0, deletions: 0, fileCount: 0 };
  }
}

export function generatePatch(repoPath: string, baseSha: string, headSha: string): string {
  return execSync(
    `git diff ${baseSha}..${headSha}`,
    { cwd: repoPath, encoding: "utf-8" }
  );
}
