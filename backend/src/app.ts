import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { globalRateLimit } from "./middleware/rateLimit.js";
import { optionalAuth } from "./middleware/auth.js";
import { API_PREFIX } from "./config/constants.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import repoRoutes from "./routes/repos.routes.js";
import gitRoutes from "./routes/git.routes.js";
import issueRoutes from "./routes/issues.routes.js";
import pullRoutes from "./routes/pulls.routes.js";
import actionRoutes from "./routes/actions.routes.js";
import codespaceRoutes from "./routes/codespaces.routes.js";
import packageRoutes from "./routes/packages.routes.js";
import orgRoutes from "./routes/orgs.routes.js";
import teamRoutes from "./routes/teams.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import discussionRoutes from "./routes/discussions.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import searchRoutes from "./routes/search.routes.js";
import webhookRoutes from "./routes/webhooks.routes.js";
import lfsRoutes from "./routes/lfs.routes.js";
import wikiRoutes from "./routes/wiki.routes.js";
import securityRoutes from "./routes/security.routes.js";
import insightRoutes from "./routes/insights.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import pageRoutes from "./routes/pages.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);
app.use(globalRateLimit);
app.use(optionalAuth);

app.get("/", (_req, res) => {
  res.json({ message: "VETERAN API", version: "1.0.0" });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/repos`, repoRoutes);
app.use(`${API_PREFIX}/repos`, gitRoutes);
app.use(`${API_PREFIX}/repos`, issueRoutes);
app.use(`${API_PREFIX}/repos`, pullRoutes);
app.use(`${API_PREFIX}/repos`, actionRoutes);
app.use(`${API_PREFIX}/user`, codespaceRoutes);
app.use(`${API_PREFIX}/user`, notificationRoutes);
app.use(`${API_PREFIX}/packages`, packageRoutes);
app.use(`${API_PREFIX}/orgs`, orgRoutes);
app.use(`${API_PREFIX}/orgs`, teamRoutes);
app.use(`${API_PREFIX}/repos`, projectRoutes);
app.use(`${API_PREFIX}/repos`, discussionRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/repos`, webhookRoutes);
app.use(`${API_PREFIX}/repos`, lfsRoutes);
app.use(`${API_PREFIX}/repos`, wikiRoutes);
app.use(`${API_PREFIX}/repos`, securityRoutes);
app.use(`${API_PREFIX}/repos`, insightRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}`, metaRoutes);
app.use(`${API_PREFIX}/repos`, pageRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);

app.use(errorHandler);

export default app;
