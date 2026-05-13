import { execSync } from "node:child_process";
import { gitService } from "./git.service.js";
import { DiffFile, UnifiedDiff, parseDiffStat } from "../../utils/diff.js";

export class DiffService {
  getCommitDiff(fullName: string, commitSha: string): UnifiedDiff {
    const repoPath = gitService.getRepoPath(fullName);

    const numstat = execSync(
      `git diff ${commitSha}^..${commitSha} --numstat`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    const files = parseDiffStat(numstat);
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of files) {
      totalAdditions += file.additions;
      totalDeletions += file.deletions;
    }

    return { files, totalAdditions, totalDeletions, totalFiles: files.length };
  }

  getBranchCompare(fullName: string, base: string, head: string): UnifiedDiff {
    const repoPath = gitService.getRepoPath(fullName);

    const numstat = execSync(
      `git diff ${base}..${head} --numstat`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    const files = parseDiffStat(numstat);
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of files) {
      totalAdditions += file.additions;
      totalDeletions += file.deletions;
    }

    return { files, totalAdditions, totalDeletions, totalFiles: files.length };
  }

  getFileDiff(fullName: string, baseSha: string, headSha: string, filePath: string): string {
    const repoPath = gitService.getRepoPath(fullName);

    return execSync(
      `git diff ${baseSha}..${headSha} -- "${filePath}"`,
      { cwd: repoPath, encoding: "utf-8" }
    );
  }

  getCommitFilePatch(fullName: string, commitSha: string, filePath: string): string {
    const repoPath = gitService.getRepoPath(fullName);

    return execSync(
      `git show ${commitSha} -- "${filePath}"`,
      { cwd: repoPath, encoding: "utf-8" }
    );
  }

  getCommitDiffWithPatch(fullName: string, commitSha: string): { files: (DiffFile & { patch: string })[] } {
    const repoPath = gitService.getRepoPath(fullName);

    const numstat = execSync(
      `git diff ${commitSha}^..${commitSha} --numstat`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    const files = parseDiffStat(numstat);

    const diffPatch = execSync(
      `git diff ${commitSha}^..${commitSha}`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    const filesWithPatch = files.map((file) => {
      return {
        ...file,
        patch: this.extractFilePatch(diffPatch, file.path),
      };
    });

    return { files: filesWithPatch };
  }

  getPrDiffStat(fullName: string, baseSha: string, headSha: string): UnifiedDiff {
    return this.getBranchCompare(fullName, baseSha, headSha);
  }

  getMergeBaseDiff(fullName: string, baseRef: string, headRef: string): string {
    const repoPath = gitService.getRepoPath(fullName);

    const mergeBase = execSync(`git merge-base "${baseRef}" "${headRef}"`, {
      cwd: repoPath,
      encoding: "utf-8",
    }).trim();

    return execSync(
      `git diff ${mergeBase}..${headRef}`,
      { cwd: repoPath, encoding: "utf-8" }
    );
  }

  isMergeable(fullName: string, base: string, head: string): boolean {
    const repoPath = gitService.getRepoPath(fullName);

    try {
      execSync(
        `git merge-tree $(git merge-base "${base}" "${head}") "${base}" "${head}"`,
        { cwd: repoPath, stdio: "pipe", encoding: "utf-8" }
      );
      return true;
    } catch {
      return false;
    }
  }

  private extractFilePatch(fullDiff: string, filePath: string): string {
    const lines = fullDiff.split("\n");
    const patchLines: string[] = [];
    let inTarget = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("diff --git")) {
        if (inTarget) break;
        inTarget = line.includes(`a/${filePath}`) || line.includes(`b/${filePath}`);
      }

      if (inTarget) {
        patchLines.push(line);
      }
    }

    return patchLines.join("\n");
  }

  async getFileLastCommit(fullName: string, filePath: string, ref: string = "HEAD"): Promise<Record<string, unknown> | null> {
    const repoPath = gitService.getRepoPath(fullName);

    try {
      const output = execSync(
        `git log -1 --format="%H %an %ae %ai %s" "${ref}" -- "${filePath}"`,
        { cwd: repoPath, encoding: "utf-8" }
      ).trim();

      if (!output) return null;

      const parts = output.split(" ");
      return {
        sha: parts[0],
        authorName: parts[1],
        authorEmail: parts[2],
        date: parts.slice(3, 6).join(" "),
        message: parts.slice(6).join(" "),
      };
    } catch {
      return null;
    }
  }
}

export const diffService = new DiffService();
