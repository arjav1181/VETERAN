import { Router, Request, Response } from "express";
import { APP_NAME, APP_VERSION, APP_DESCRIPTION, IS_SELF_HOSTED } from "../config/constants.js";
import { getRedis } from "../config/redis.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/features", (_req: Request, res: Response) => {
  res.json({
    selfHosted: IS_SELF_HOSTED,
    codespaces: env.CODESPACES_ENABLED,
    packages: env.PACKAGES_ENABLED,
    actions: env.ACTIONS_ENABLED,
    analytics: env.ANALYTICS_ENABLED,
    aiSearch: env.AI_SEARCH_ENABLED,
    email: env.SMTP_HOST !== undefined && env.SMTP_HOST !== "",
    oauth: env.OAUTH_ENABLED,
    webhooks: env.WEBHOOKS_ENABLED,
    wiki: env.WIKI_ENABLED,
    discussions: env.DISCUSSIONS_ENABLED,
    projects: env.PROJECTS_ENABLED,
    insights: env.INSIGHTS_ENABLED,
    adminPanel: env.ADMIN_ENABLED,
    importRepo: true,
  });
});

router.get("/", (_req: Request, res: Response) => {
  res.json({
    name: APP_NAME,
    version: APP_VERSION,
    description: APP_DESCRIPTION,
    documentation_url: "https://docs.veteran.dev",
  });
});

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const redis = getRedis();
    await redis.ping();
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy", error: "Redis unavailable" });
  }
});

router.get("/meta", (_req: Request, res: Response) => {
  res.json({
    current_user_url: "/user",
    current_user_authorizations_html_url: "/settings/connections/applications",
    authorizations_url: "/authorizations",
    code_search_url: "/search/code?q={query}",
    commit_search_url: "/search/commits?q={query}",
    emails_url: "/user/emails",
    emojis_url: "/emojis",
    events_url: "/events",
    feeds_url: "/feeds",
    followers_url: "/user/followers",
    following_url: "/user/following",
    gists_url: "/gists",
    hub_url: "/hub",
    issue_search_url: "/search/issues?q={query}",
    issues_url: "/issues",
    keys_url: "/user/keys",
    label_search_url: "/search/labels?q={query}",
    notifications_url: "/notifications",
    organization_url: "/orgs/{org}",
    organization_repositories_url: "/orgs/{org}/repos",
    organization_teams_url: "/orgs/{org}/teams",
    public_gists_url: "/gists/public",
    rate_limit_url: "/rate_limit",
    repository_url: "/repos/{owner}/{repo}",
    repository_search_url: "/search/repositories?q={query}",
    current_user_repositories_url: "/user/repos",
    starred_url: "/user/starred",
    starred_gists_url: "/gists/starred",
    team_url: "/teams/{team_id}",
    user_url: "/users/{user}",
    user_organizations_url: "/user/orgs",
    user_repositories_url: "/users/{user}/repos",
    user_search_url: "/search/users?q={query}",
    api_version: "v1",
  });
});

router.get("/rate_limit", async (_req: Request, res: Response) => {
  res.json({
    resources: {
      core: { limit: 5000, remaining: 4999, reset: Math.floor(Date.now() / 1000) + 3600 },
      search: { limit: 30, remaining: 29, reset: Math.floor(Date.now() / 1000) + 3600 },
    },
    rate: { limit: 5000, remaining: 4999, reset: Math.floor(Date.now() / 1000) + 3600 },
  });
});

router.get("/feeds", (_req: Request, res: Response) => {
  res.json({
    timeline_url: "/events",
    user_url: "/users/{user}/events",
    current_user_public_url: "/user/events",
    current_user_url: "/user/events",
    current_user_actor_url: "/user/events",
    current_user_organization_url: "",
    current_user_organization_urls: [],
    _links: {
      timeline: { href: "/events", type: "application/atom+xml" },
      user: { href: "/users/{user}/events", type: "application/atom+xml" },
      current_user_public: { href: "/user/events", type: "application/atom+xml" },
      current_user: { href: "/user/events", type: "application/atom+xml" },
    },
  });
});

router.get("/emojis", (_req: Request, res: Response) => {
  res.json({
    "+1": "https://github.githubassets.com/images/icons/emoji/unicode/1f44d.png",
    "-1": "https://github.githubassets.com/images/icons/emoji/unicode/1f44e.png",
    heart: "https://github.githubassets.com/images/icons/emoji/unicode/2764.png",
    rocket: "https://github.githubassets.com/images/icons/emoji/unicode/1f680.png",
    eyes: "https://github.githubassets.com/images/icons/emoji/unicode/1f440.png",
  });
});

router.get("/gitignore/templates", (_req: Request, res: Response) => {
  res.json(["Node", "Python", "Java", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Android", "VisualStudio", "C++", "C"]);
});

router.get("/licenses", (_req: Request, res: Response) => {
  res.json([
    { key: "mit", name: "MIT License", spdx_id: "MIT", url: "https://api.github.com/licenses/mit", featured: true },
    { key: "apache-2.0", name: "Apache License 2.0", spdx_id: "Apache-2.0", url: "https://api.github.com/licenses/apache-2.0", featured: true },
    { key: "gpl-3.0", name: "GNU General Public License v3.0", spdx_id: "GPL-3.0", url: "https://api.github.com/licenses/gpl-3.0", featured: true },
    { key: "bsd-2-clause", name: "BSD 2-Clause License", spdx_id: "BSD-2-Clause", url: "https://api.github.com/licenses/bsd-2-clause", featured: false },
    { key: "bsd-3-clause", name: "BSD 3-Clause License", spdx_id: "BSD-3-Clause", url: "https://api.github.com/licenses/bsd-3-clause", featured: false },
    { key: "unlicense", name: "The Unlicense", spdx_id: "Unlicense", url: "https://api.github.com/licenses/unlicense", featured: false },
  ]);
});

export default router;
