import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { gitService } from "../services/git/git.service.js";
import { logger } from "../utils/logger.js";

export function handleGitCommand(
  stream: { stdin: NodeJS.ReadableStream; stdout: NodeJS.WritableStream; stderr: NodeJS.WritableStream; exit: (code: number) => void },
  session: { stdin: NodeJS.ReadableStream; stdout: NodeJS.WritableStream; stderr: NodeJS.WritableStream }
): void {
  let command = "";
  let repoPath = "";

  stream.stdin.on("data", (data: Buffer) => {
    command += data.toString();
  });

  stream.stdin.on("end", () => {
    const trimmed = command.trim();
    logger.info("SSH git command", { command: trimmed });

    if (trimmed.startsWith("git-upload-pack") || trimmed.startsWith("git-receive-pack")) {
      const parts = trimmed.split(" ");
      const repoArg = parts[1] || "";
      const repoName = repoArg.replace(/^['"]|['"]$/g, "").replace(/^\//, "");
      repoPath = gitService.getRepoPath(repoName);

      if (!existsSync(repoPath)) {
        stream.stderr.write(`ERROR: Repository not found: ${repoName}\n`);
        stream.exit(1);
        return;
      }

      const gitCmd = exec(trimmed, { cwd: repoPath });

      gitCmd.stdout?.pipe(stream.stdout);
      stream.stdin.pipe(gitCmd.stdin!);

      gitCmd.on("exit", (code) => {
        stream.exit(code || 0);
      });

      gitCmd.on("error", (err) => {
        stream.stderr.write(`ERROR: ${err.message}\n`);
        stream.exit(1);
      });
    } else {
      stream.stderr.write("ERROR: Unknown command\n");
      stream.exit(1);
    }
  });
}
