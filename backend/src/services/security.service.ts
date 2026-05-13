import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import prisma from "../config/database.js";
import { gitService } from "./git/git.service.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";

interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: "low" | "medium" | "high" | "critical";
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "high" },
  { name: "AWS Secret Key", regex: /aws(.{0,20})?['\"][0-9a-zA-Z\/+]{40}['\"]/gi, severity: "high" },
  { name: "GitHub Token", regex: /(?:gh[pousr]_[A-Za-z0-9_]{36,251}|github_pat_[A-Za-z0-9_]{82,})/g, severity: "high" },
  { name: "GitLab Token", regex: /glpat-[A-Za-z0-9\-_]{20,}/g, severity: "high" },
  { name: "Slack Token", regex: /xox[baprs]-[0-9a-z-]{10,48}/g, severity: "medium" },
  { name: "Private Key", regex: /-----BEGIN\s?(RSA|DSA|EC|OPENSSH|PRIVATE)\s?KEY-----/g, severity: "critical" },
  { name: "JWT Token", regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, severity: "medium" },
  { name: "Password in Code", regex: /(password|passwd|pwd)\s*[:=]\s*['\"][^'\"]{3,}['\"]/gi, severity: "medium" },
  { name: "API Key", regex: /(api[_-]?key|apikey)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]/gi, severity: "high" },
  { name: "Secret in Code", regex: /(secret)\s*[:=]\s*['\"][A-Za-z0-9_\-!@#$%^&*()]{8,}['\"]/gi, severity: "high" },
  { name: "Connection String", regex: /(mongodb|postgres|mysql|redis):\/\/[^\s'"]+/gi, severity: "medium" },
  { name: "npm Token", regex: /npm_[A-Za-z0-9]{36,}/g, severity: "high" },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/g, severity: "medium" },
  { name: "Heroku API Key", regex: /[hH][eE][rR][oO][kK][uU].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/g, severity: "high" },
];

export interface ScanResult {
  file: string;
  line: number;
  column: number;
  pattern: string;
  match: string;
  severity: string;
}

export class SecurityService {
  async scanRepository(fullName: string, ref: string = "HEAD"): Promise<ScanResult[]> {
    const repoPath = gitService.getRepoPath(fullName);
    if (!existsSync(repoPath)) throw new NotFoundError("Repository");

    const results: ScanResult[] = [];

    try {
      const output = execSync(
        `git ls-tree -r "${ref}" --name-only`,
        { cwd: repoPath, encoding: "utf-8" }
      );

      const files = output.trim().split("\n").filter(Boolean);

      for (const file of files.slice(0, 1000)) {
        if (this.shouldSkipFile(file)) continue;

        try {
          const content = execSync(
            `git show "${ref}:${file}"`,
            { cwd: repoPath, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
          );

          const lines = content.split("\n");
          for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum] || "";
            for (const pattern of SECRET_PATTERNS) {
              const matches = line.matchAll(pattern.regex);
              for (const match of matches) {
                if (match.index !== undefined && !this.isFalsePositive(match[0], file)) {
                  results.push({
                    file,
                    line: lineNum + 1,
                    column: match.index,
                    pattern: pattern.name,
                    match: this.maskMatch(match[0]),
                    severity: pattern.severity,
                  });
                }
              }
            }
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Scan failed
    }

    return results;
  }

  async getVulnerabilities(repositoryId: string, page: number = 1, perPage: number = 30) {
    return { items: [], total: 0, page, perPage };
  }

  async createAdvisory(data: {
    repositoryId: string;
    title: string;
    description: string;
    severity: string;
    cvssScore?: number;
    cveId?: string;
    affectedVersions?: string;
    patchedVersions?: string;
    authorId?: string;
  }) {
    return { id: "advisory-1", ...data };
  }

  async getDependabotAlerts(repositoryId: string) {
    return [];
  }

  async checkBranchProtection(repositoryId: string, branch: string, sha: string): Promise<{
    allowed: boolean;
    requiredChecks: string[];
    requiredReviews: number;
  }> {
    const protection = await prisma.branchProtection.findFirst({
      where: { repositoryId, branch },
    });

    if (!protection) {
      return { allowed: true, requiredChecks: [], requiredReviews: 0 };
    }

    return {
      allowed: true,
      requiredChecks: protection.requiredStatusChecks,
      requiredReviews: protection.requiredReviews,
    };
  }

  async validateCommitSignature(fullName: string, sha: string): Promise<boolean> {
    const repoPath = gitService.getRepoPath(fullName);
    if (!existsSync(repoPath)) return false;

    try {
      execSync(`git verify-commit "${sha}"`, { cwd: repoPath, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  private shouldSkipFile(file: string): boolean {
    const skipPatterns = [
      /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|zip|tar|gz|rar|exe|dll|so|dylib|bin|dat|mp4|avi|mov|pdf|docx|xlsx)$/i,
      /^vendor\//,
      /^node_modules\//,
      /^\.git\//,
      /^dist\//,
      /^build\//,
      /^\.next\//,
    ];

    return skipPatterns.some(p => p.test(file));
  }

  private isFalsePositive(match: string, file: string): boolean {
    const falsePositivePatterns = [
      /^[0-9]+$/,
      /^test/i,
      /example/i,
      /sample/i,
      /placeholder/i,
      /^0{10,}$/,
      /^x{10,}$/,
    ];

    if (falsePositivePatterns.some(p => p.test(match))) return true;

    if (file.includes("test") || file.includes("spec") || file.includes("example")) return true;

    return false;
  }

  private maskMatch(match: string): string {
    if (match.length <= 8) return match;
    return match.slice(0, 4) + "*".repeat(Math.min(match.length - 8, 40)) + match.slice(-4);
  }
}

export const securityService = new SecurityService();
