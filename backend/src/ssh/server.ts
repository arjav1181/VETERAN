import ssh2 from "ssh2";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { handleGitCommand } from "./handler.js";
import { authenticateKey } from "./auth.js";

const { Server: SshServer } = ssh2;

let sshServer: ReturnType<typeof createServer> | null = null;

function createServer(hostKey: Buffer, port: number): ssh2.Server {
  const server = new SshServer(
    {
      hostKeys: [hostKey],
    },
    (client: ssh2.Connection) => {
      client.on("authentication", (ctx) => {
        authenticateKey(ctx);
      });

      client.on("ready", () => {
        logger.info("SSH client authenticated");

        client.on("session", (accept: () => ssh2.Session) => {
          const session = accept();
          session.on("exec", (acceptExec: () => ssh2.ServerChannel, _info: ssh2.ExecInfo) => {
            const stream = acceptExec();
            handleGitCommand(stream, stream);
          });
        });
      });

      client.on("error", (err: Error) => {
        logger.error("SSH client error", { error: err.message });
      });

      client.on("close", () => {
        logger.info("SSH client disconnected");
      });
    }
  );
  return server;
}

export async function startSshServer(): Promise<void> {
  const hostKeyPath = resolve(env.GIT_SSH_HOST_KEY);
  const hostKeyDir = hostKeyPath.substring(0, hostKeyPath.lastIndexOf("/"));

  if (!existsSync(hostKeyDir)) {
    mkdirSync(hostKeyDir, { recursive: true });
  }

  if (!existsSync(hostKeyPath)) {
    const { execSync } = await import("node:child_process");
    execSync(`ssh-keygen -t rsa -b 4096 -f "${hostKeyPath}" -N "" -q`, { stdio: "pipe" });
    logger.info("Generated SSH host key", { path: hostKeyPath });
  }

  const hostKey = readFileSync(hostKeyPath);
  sshServer = createServer(hostKey, env.GIT_SSH_PORT);

  sshServer.listen(env.GIT_SSH_PORT, "0.0.0.0", () => {
    logger.info(`SSH server listening on port ${env.GIT_SSH_PORT}`);
  });

  sshServer.on("error", (err: Error) => {
    logger.error("SSH server error", { error: err.message });
  });
}

export function stopSshServer(): void {
  if (sshServer) {
    sshServer.close();
    logger.info("SSH server stopped");
  }
}
