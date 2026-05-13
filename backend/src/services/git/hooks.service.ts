import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { gitService } from "./git.service.js";

export interface HookInput {
  repository: string;
  ref: string;
  oldSha: string;
  newSha: string;
  userName: string;
  userEmail: string;
}

export interface HookResult {
  allowed: boolean;
  message?: string;
}

export class HooksService {
  private hooksDir: string;

  constructor() {
    this.hooksDir = join(gitService["dataDir"], "hooks");
    if (!existsSync(this.hooksDir)) {
      mkdirSync(this.hooksDir, { recursive: true });
    }
  }

  async runPreReceive(hooks: string[], input: HookInput[]): Promise<HookResult[]> {
    const results: HookResult[] = [];

    for (const hook of hooks) {
      const hookPath = join(this.hooksDir, "pre-receive", hook);
      if (!existsSync(hookPath)) continue;

      try {
        const hookInput = input.map(
          i => `${i.oldSha} ${i.newSha} ${i.ref}`
        ).join("\n");

        execSync(`"${hookPath}"`, {
          input: hookInput,
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 30000,
        });

        results.push({ allowed: true });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Hook rejected";
        results.push({ allowed: false, message });
        return results;
      }
    }

    if (results.length === 0) {
      results.push({ allowed: true });
    }

    return results;
  }

  async runUpdate(hooks: string[], input: HookInput): Promise<HookResult> {
    for (const hook of hooks) {
      const hookPath = join(this.hooksDir, "update", hook);
      if (!existsSync(hookPath)) continue;

      try {
        execSync(
          `"${hookPath}" "${input.ref}" "${input.oldSha}" "${input.newSha}" "${input.userName}"`,
          { stdio: "pipe", timeout: 30000 }
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Hook rejected";
        return { allowed: false, message };
      }
    }

    return { allowed: true };
  }

  async runPostReceive(hooks: string[], input: HookInput[]): Promise<void> {
    for (const hook of hooks) {
      const hookPath = join(this.hooksDir, "post-receive", hook);
      if (!existsSync(hookPath)) continue;

      try {
        const hookInput = input.map(
          i => `${i.oldSha} ${i.newSha} ${i.ref}`
        ).join("\n");

        execSync(`"${hookPath}"`, {
          input: hookInput,
          stdio: "pipe",
          timeout: 60000,
        }).catch(() => {});
      } catch {
        // Post-receive hooks should not block
      }
    }
  }

  async runPrePush(input: HookInput): Promise<HookResult> {
    return { allowed: true };
  }

  async runPostMerge(fullName: string): Promise<void> {
    // Placeholder for post-merge hooks
  }

  installDefaultHooks(fullName: string): void {
    const repoHooksDir = join(gitService.getRepoPath(fullName), "hooks");
    if (!existsSync(repoHooksDir)) {
      mkdirSync(repoHooksDir, { recursive: true });
    }

    const updateHook = `#!/bin/sh
# VETERAN update hook
refname="$1"
oldrev="$2"
newrev="$3"

# Check branch protection rules
echo "VETERAN: Update hook executed"
`;

    writeFileSync(join(repoHooksDir, "update"), updateHook, { mode: 0o755 });
  }
}

function writeFileSync(path: string, data: string, options?: { mode?: number }): void {
  const fs = require("fs");
  fs.writeFileSync(path, data, options);
}

export const hooksService = new HooksService();
