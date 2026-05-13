import { execSync, exec, ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { env } from "../../config/env.js";
import prisma from "../../config/database.js";
import { AppError, NotFoundError } from "../../middleware/errorHandler.js";
import { getRedis } from "../../config/redis.js";
import { CACHE_TTL } from "../../config/constants.js";

export class GitService {
  private dataDir: string;

  constructor() {
    this.dataDir = resolve(env.GIT_DATA_DIR);
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getRepoPath(fullName: string): string {
    return join(this.dataDir, fullName);
  }

  async initRepository(fullName: string, bare: boolean = true): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    if (existsSync(repoPath)) {
      throw new AppError("Repository already exists", 409, "REPO_EXISTS");
    }

    mkdirSync(repoPath, { recursive: true });
    const cmd = bare ? `git init --bare "${repoPath}"` : `git init "${repoPath}"`;
    execSync(cmd, { stdio: "pipe" });

    if (!bare) {
      writeFileSync(
        join(repoPath, ".gitattributes"),
        "* text=auto\n"
      );
    }
  }

  async cloneRepository(srcPath: string, destPath: string): Promise<void> {
    const dest = this.getRepoPath(destPath);
    if (existsSync(dest)) {
      throw new AppError("Repository already exists", 409, "REPO_EXISTS");
    }

    mkdirSync(dest, { recursive: true });
    execSync(`git clone --bare "${srcPath}" "${dest}"`, { stdio: "pipe" });
  }

  async deleteRepository(fullName: string): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    if (!existsSync(repoPath)) return;
    execSync(`rm -rf "${repoPath}"`, { stdio: "pipe" });
  }

  async getBranches(fullName: string): Promise<{ name: string; sha: string; isProtected: boolean }[]> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const output = execSync(`git branch --format="%(refname:short) %(objectname)"`, {
      cwd: repoPath,
      encoding: "utf-8",
    });

    const branches = output.trim().split("\n").filter(Boolean).map(line => {
      const [name, sha] = line.split(" ");
      return { name, sha, isProtected: false };
    });

    const repo = await prisma.repository.findUnique({ where: { fullName } });
    if (repo) {
      const protectedBranches = await prisma.branchProtection.findMany({
        where: { repositoryId: repo.id },
      });
      for (const branch of branches) {
        branch.isProtected = protectedBranches.some(
          bp => branch.name === bp.branch || branch.name.startsWith(bp.branch.replace("*", ""))
        );
      }
    }

    return branches;
  }

  async getBranch(fullName: string, branchName: string): Promise<{ name: string; sha: string } | null> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    try {
      const sha = execSync(`git rev-parse "${branchName}"`, {
        cwd: repoPath,
        encoding: "utf-8",
      }).trim();
      return { name: branchName, sha };
    } catch {
      return null;
    }
  }

  async createBranch(fullName: string, branchName: string, sourceSha?: string): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    if (sourceSha) {
      execSync(`git branch "${branchName}" "${sourceSha}"`, { cwd: repoPath, stdio: "pipe" });
    } else {
      execSync(`git branch "${branchName}"`, { cwd: repoPath, stdio: "pipe" });
    }
  }

  async deleteBranch(fullName: string, branchName: string): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const repo = await prisma.repository.findUnique({ where: { fullName } });
    if (repo) {
      const protection = await prisma.branchProtection.findFirst({
        where: { repositoryId: repo.id, branch: branchName },
      });
      if (protection && !protection.allowForcePush && !protection.allowDeletions) {
        throw new AppError("Branch is protected and cannot be deleted", 403, "PROTECTED_BRANCH");
      }
    }

    execSync(`git branch -D "${branchName}"`, { cwd: repoPath, stdio: "pipe" });
  }

  async getTags(fullName: string): Promise<{ name: string; sha: string }[]> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const output = execSync(`git tag --format="%(refname:short) %(objectname)"`, {
      cwd: repoPath,
      encoding: "utf-8",
    });

    return output.trim().split("\n").filter(Boolean).map(line => {
      const [name, sha] = line.split(" ");
      return { name, sha };
    });
  }

  async createTag(fullName: string, tagName: string, sha: string, message?: string): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    if (message) {
      execSync(`git tag -a "${tagName}" "${sha}" -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: repoPath,
        stdio: "pipe",
      });
    } else {
      execSync(`git tag "${tagName}" "${sha}"`, { cwd: repoPath, stdio: "pipe" });
    }
  }

  async deleteTag(fullName: string, tagName: string): Promise<void> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);
    execSync(`git tag -d "${tagName}"`, { cwd: repoPath, stdio: "pipe" });
  }

  async getCommit(fullName: string, sha: string): Promise<Record<string, unknown> | null> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    try {
      const format = [
        "---",
        "sha: %H",
        "tree: %T",
        "parent: %P",
        "author_name: %an",
        "author_email: %ae",
        "author_date: %ai",
        "committer_name: %cn",
        "committer_email: %ce",
        "committer_date: %ci",
        "message: %B",
        "---",
      ].join("%n");

      const output = execSync(
        `git show --no-patch --format="${format}" "${sha}"`,
        { cwd: repoPath, encoding: "utf-8" }
      );

      return this.parseCommitOutput(output);
    } catch {
      return null;
    }
  }

  async getCommitList(fullName: string, branch: string, page: number = 1, perPage: number = 30): Promise<Record<string, unknown>[]> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const skip = (page - 1) * perPage;
    const format = [
      "---",
      "sha: %H",
      "tree: %T",
      "parent: %P",
      "author_name: %an",
      "author_email: %ae",
      "author_date: %ai",
      "committer_name: %cn",
      "committer_email: %ce",
      "committer_date: %ci",
      "message: %B",
      "---",
    ].join("%n");

    const output = execSync(
      `git log "${branch}" --format="${format}" --skip=${skip} --max-count=${perPage}`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    return this.parseCommitsOutput(output);
  }

  async getTree(fullName: string, sha: string, recursive: boolean = false): Promise<{
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
  }[]> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const recursiveFlag = recursive ? "-r" : "";
    const output = execSync(
      `git ls-tree ${recursiveFlag} "${sha}"`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    return output.trim().split("\n").filter(Boolean).map(line => {
      const [mode, type, hash, ...pathParts] = line.split(/\s+/);
      const path = pathParts.join(" ");
      return { path, mode, type, sha: hash };
    });
  }

  async getBlob(fullName: string, sha: string): Promise<Buffer> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return execSync(`git cat-file -p "${sha}"`, { cwd: repoPath, encoding: "buffer" });
  }

  async getBlobAsString(fullName: string, sha: string): Promise<string> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return execSync(`git cat-file -p "${sha}"`, { cwd: repoPath, encoding: "utf-8" });
  }

  async getFileContent(fullName: string, path: string, ref: string = "HEAD"): Promise<{
    content: string;
    sha: string;
    size: number;
    encoding: string;
  } | null> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    try {
      const sha = execSync(`git rev-parse "${ref}:${path}"`, {
        cwd: repoPath,
        encoding: "utf-8",
      }).trim();

      const output = execSync(`git show "${ref}:${path}"`, {
        cwd: repoPath,
        encoding: "buffer",
      });

      const size = output.length;
      const isBinary = output.includes(0);
      const content = isBinary ? output.toString("base64") : output.toString("utf-8");

      return {
        content,
        sha,
        size,
        encoding: isBinary ? "base64" : "utf-8",
      };
    } catch {
      return null;
    }
  }

  async commitExists(fullName: string, sha: string): Promise<boolean> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    try {
      execSync(`git cat-file -e "${sha}"`, { cwd: repoPath, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  async compareCommits(fullName: string, base: string, head: string): Promise<{
    status: string;
    aheadBy: number;
    behindBy: number;
  }> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    try {
      const aheadBehind = execSync(
        `git rev-list --count --left-right "${base}...${head}"`,
        { cwd: repoPath, encoding: "utf-8" }
      ).trim();

      const [behindBy, aheadBy] = aheadBehind.split("\t").map(Number);

      let status = "identical";
      if (aheadBy > 0 && behindBy > 0) status = "diverged";
      else if (aheadBy > 0) status = "ahead";
      else if (behindBy > 0) status = "behind";

      return { status, aheadBy: aheadBy || 0, behindBy: behindBy || 0 };
    } catch {
      return { status: "unknown", aheadBy: 0, behindBy: 0 };
    }
  }

  async mergeBase(fullName: string, commit1: string, commit2: string): Promise<string> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return execSync(`git merge-base "${commit1}" "${commit2}"`, {
      cwd: repoPath,
      encoding: "utf-8",
    }).trim();
  }

  async archive(fullName: string, ref: string, format: "zip" | "tar.gz" = "zip"): Promise<Buffer> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const archiveFormat = format === "tar.gz" ? "tar.gz" : "zip";
    return execSync(`git archive --format=${archiveFormat} "${ref}"`, {
      cwd: repoPath,
      encoding: "buffer",
    });
  }

  async getObjectType(fullName: string, sha: string): Promise<string> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return execSync(`git cat-file -t "${sha}"`, { cwd: repoPath, encoding: "utf-8" }).trim();
  }

  async getObjectSize(fullName: string, sha: string): Promise<number> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return parseInt(
      execSync(`git cat-file -s "${sha}"`, { cwd: repoPath, encoding: "utf-8" }).trim()
    );
  }

  async getRefSha(fullName: string, ref: string): Promise<string> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    return execSync(`git rev-parse --verify "${ref}"`, {
      cwd: repoPath,
      encoding: "utf-8",
    }).trim();
  }

  async listRefs(fullName: string): Promise<Record<string, string>> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    const output = execSync(
      `git show-ref --head --dereference`,
      { cwd: repoPath, encoding: "utf-8" }
    );

    const refs: Record<string, string> = {};
    for (const line of output.trim().split("\n").filter(Boolean)) {
      const [sha, ref] = line.split(" ");
      if (!ref.endsWith("^{}")) {
        refs[ref] = sha;
      }
    }
    return refs;
  }

  setDefaultBranch(fullName: string, branchName: string): void {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    execSync(`git symbolic-ref HEAD refs/heads/${branchName}`, {
      cwd: repoPath,
      stdio: "pipe",
    });
  }

  async gitUploadPack(fullName: string): Promise<ChildProcess> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);
    return exec(`git-upload-pack "${repoPath}"`);
  }

  async gitReceivePack(fullName: string): Promise<ChildProcess> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);
    return exec(`git-receive-pack "${repoPath}"`);
  }

  async handleSmartHttp(fullName: string, service: string, input: Buffer | null): Promise<{ body: Buffer; contentType: string }> {
    const repoPath = this.getRepoPath(fullName);
    this.ensureRepo(repoPath);

    if (service === "info/refs") {
      const queryService = "upload-pack";
      const output = execSync(
        `git service --advertise-refs "${queryService}"`,
        { cwd: repoPath, encoding: "buffer" }
      );

      const header = `# service=${queryService}\n`;
      const packetLen = (header.length + 4).toString(16).padStart(4, "0");
      const response = Buffer.concat([
        Buffer.from(`${packetLen}${header}`),
        Buffer.from("0000"),
        output,
      ]);

      return {
        body: response,
        contentType: `application/x-git-${queryService}-advertisement`,
      };
    }

    if (service === "upload-pack" || service === "receive-pack") {
      const gitCmd = service === "upload-pack" ? "upload-pack" : "receive-pack";
      const output = execSync(
        `git ${gitCmd} --stateless-rpc "${repoPath}"`,
        { cwd: repoPath, input, encoding: "buffer" }
      );

      return {
        body: output,
        contentType: `application/x-git-${service}-result`,
      };
    }

    throw new AppError(`Unknown git service: ${service}`, 400, "INVALID_SERVICE");
  }

  private parseCommitOutput(output: string): Record<string, unknown> | null {
    const sections = output.split("---\n").filter(Boolean);
    if (sections.length < 2) return null;

    const header = sections[0];
    const message = sections.slice(1).join("---\n").trim();

    const lines = header.split("\n").filter(Boolean);
    const commit: Record<string, unknown> = {};

    for (const line of lines) {
      const colonIdx = line.indexOf(": ");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 2).trim();
      commit[key] = value;
    }

    commit.message = message;

    if (commit.parent) {
      commit.parents = String(commit.parent).split(" ").filter(Boolean);
    } else {
      commit.parents = [];
    }

    return commit;
  }

  private parseCommitsOutput(output: string): Record<string, unknown>[] {
    const blocks = output.split("---\n").filter(Boolean);
    const commits: Record<string, unknown>[] = [];
    let currentCommit: Record<string, unknown> | null = null;

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const firstColon = trimmed.indexOf("sha: ");
      if (firstColon !== -1) {
        if (currentCommit) {
          commits.push(currentCommit);
        }
        currentCommit = this.parseCommitOutput(trimmed) || {};
      }
    }

    if (currentCommit) {
      commits.push(currentCommit);
    }

    return commits;
  }

  private ensureRepo(repoPath: string): void {
    if (!existsSync(repoPath)) {
      throw new NotFoundError("Repository");
    }
  }
}

export const gitService = new GitService();
