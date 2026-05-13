import { z } from "zod";

const rawSchema = z.object({
  // Mode
  SELF_HOSTED: z.string().default("true"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Server
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  APP_URL: z.string().default("http://localhost:3000"),
  DATA_PATH: z.string().default("./data"),

  // Database
  DATABASE_PROVIDER: z.string().default("sqlite"),
  DATABASE_URL: z.string().default("file:./data/veteran.db"),

  // Redis
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  JWT_ISSUER: z.string().default("veteran"),
  ENCRYPTION_KEY: z.string().optional(),
  APP_SECRET: z.string().default("change-me-to-a-random-64-char-string"),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("noreply@veteran.dev"),
  SMTP_SECURE: z.string().default("false"),
  EMAIL_VERIFICATION_REQUIRED: z.string().default("false"),
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: z.string().default("24h"),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default("1h"),

  // Storage
  STORAGE_DIR: z.string().default("./data/storage"),
  STORAGE_TYPE: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().default("false"),

  // Git
  GIT_DATA_DIR: z.string().default("./data/repos"),
  GIT_SSH_HOST: z.string().default("0.0.0.0"),
  GIT_SSH_PORT: z.coerce.number().default(2222),
  GIT_SSH_HOST_KEY: z.string().default("./data/ssh/host_key"),
  GIT_LFS_ENABLED: z.string().default("true"),
  GIT_LFS_MAX_STORAGE: z.coerce.number().default(50),
  GIT_MAX_PUSH_SIZE: z.coerce.number().default(500),
  GIT_MAX_FILE_SIZE: z.coerce.number().default(100),

  // Socket
  SOCKET_PORT: z.coerce.number().default(3001),

  // CORS
  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.coerce.number().default(10),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("pretty"),

  // OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_ALLOWED_ORGS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITLAB_CLIENT_ID: z.string().optional(),
  GITLAB_CLIENT_SECRET: z.string().optional(),
  GITLAB_URL: z.string().optional(),
  BITBUCKET_CLIENT_ID: z.string().optional(),
  BITBUCKET_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_TENANT_ID: z.string().optional(),
  OIDC_ISSUER: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),

  // Feature flags (raw strings — typed below after transform)
  WEBHOOK_ENABLED: z.string().optional(),
  INSIGHTS_ENABLED: z.string().optional(),
  ADMIN_ENABLED: z.string().optional(),
  CODESPACES_ENABLED: z.string().optional(),
  AI_SEARCH_ENABLED: z.string().default("false"),
  PACKAGES_ENABLED: z.string().default("true"),
  ACTIONS_ENABLED: z.string().default("true"),
  ANALYTICS_ENABLED: z.string().optional(),
  REGISTRATION_ENABLED: z.string().default("true"),
  REGISTRATION_INVITE_ONLY: z.string().default("false"),
  REGISTRATION_DOMAIN_WHITELIST: z.string().optional(),
  WIKIS_ENABLED: z.string().default("true"),
  DISCUSSIONS_ENABLED: z.string().default("true"),
  PROJECTS_ENABLED: z.string().default("true"),
  PAGES_ENABLED: z.string().default("false"),
  CI_ENABLED: z.string().default("true"),

  // CI / Actions
  CI_RUNNER_CONCURRENCY: z.coerce.number().default(4),
  CI_JOB_TIMEOUT_MINUTES: z.coerce.number().default(60),
  CI_ARTIFACT_RETENTION_DAYS: z.coerce.number().default(90),
  CI_LOG_RETENTION_DAYS: z.coerce.number().default(30),
  CI_DEFAULT_CONTAINER_IMAGE: z.string().default("node:20-alpine"),

  // Codespaces
  CODESPACE_DEFAULT_MACHINE: z.string().default("2-core"),
  CODESPACE_MAX_MACHINE: z.string().default("16-core"),
  CODESPACE_IDLE_TIMEOUT_MINUTES: z.coerce.number().default(30),
  CODESPACE_MAX_LIFETIME_HOURS: z.coerce.number().default(8),
  CODESPACE_STORAGE_LIMIT_GB: z.coerce.number().default(32),
  CODESPACE_CONTAINER_IMAGE: z.string().default("mcr.microsoft.com/devcontainers/universal:2"),
  CODESPACE_DOCKER_NETWORK: z.string().default("veteran-codespaces"),

  // Webhooks
  WEBHOOK_MAX_RETRIES: z.coerce.number().default(3),
  WEBHOOK_TIMEOUT_SECONDS: z.coerce.number().default(10),
  WEBHOOK_PAYLOAD_SIZE_LIMIT_KB: z.coerce.number().default(256),

  // Upload
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(50),
  UPLOAD_ALLOWED_MIME_TYPES: z.string().default("image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"),

  // Admin
  ADMIN_USERNAMES: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),

  // Monitoring
  METRICS_ENABLED: z.string().default("false"),
  METRICS_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // AI / Copilot
  AI_PROVIDER: z.string().default("openai"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_OPENAI_COMPATIBLE_URL: z.string().optional(),
  AI_MAX_TOKENS: z.coerce.number().default(4096),
  AI_ENABLED: z.string().default("false"),

  // Supabase
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

function bool(v: string | undefined, defaultVal: boolean): boolean {
  if (v === undefined || v === "") return defaultVal;
  return v === "true" || v === "1";
}

const envSchema = rawSchema.transform((raw) => {
  const selfHosted = bool(raw.SELF_HOSTED, true);
  return {
    // Mode
    SELF_HOSTED: selfHosted,
    NODE_ENV: raw.NODE_ENV,

    // Server
    PORT: raw.PORT,
    HOST: raw.HOST,
    APP_URL: raw.APP_URL,
    DATA_PATH: raw.DATA_PATH,

    // Database
    DATABASE_PROVIDER: raw.DATABASE_PROVIDER,
    DATABASE_URL: raw.DATABASE_URL,

    // Redis
    REDIS_URL: raw.REDIS_URL,

    // JWT
    JWT_SECRET: raw.JWT_SECRET,
    JWT_ACCESS_EXPIRES_IN: raw.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: raw.JWT_REFRESH_EXPIRES_IN,
    JWT_ISSUER: raw.JWT_ISSUER,
    ENCRYPTION_KEY: raw.ENCRYPTION_KEY,
    APP_SECRET: raw.APP_SECRET,

    // SMTP
    SMTP_HOST: raw.SMTP_HOST,
    SMTP_PORT: raw.SMTP_PORT,
    SMTP_USER: raw.SMTP_USER,
    SMTP_PASS: raw.SMTP_PASS,
    SMTP_FROM: raw.SMTP_FROM,
    SMTP_SECURE: bool(raw.SMTP_SECURE, false),
    EMAIL_VERIFICATION_REQUIRED: bool(raw.EMAIL_VERIFICATION_REQUIRED, false),
    EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: raw.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
    PASSWORD_RESET_TOKEN_EXPIRES_IN: raw.PASSWORD_RESET_TOKEN_EXPIRES_IN,

    // Storage
    STORAGE_DIR: raw.STORAGE_DIR,
    STORAGE_TYPE: raw.STORAGE_TYPE,
    S3_ENDPOINT: raw.S3_ENDPOINT,
    S3_BUCKET: raw.S3_BUCKET,
    S3_ACCESS_KEY: raw.S3_ACCESS_KEY,
    S3_SECRET_KEY: raw.S3_SECRET_KEY,
    S3_REGION: raw.S3_REGION,
    S3_FORCE_PATH_STYLE: bool(raw.S3_FORCE_PATH_STYLE, false),

    // Git
    GIT_DATA_DIR: raw.GIT_DATA_DIR,
    GIT_SSH_HOST: raw.GIT_SSH_HOST,
    GIT_SSH_PORT: raw.GIT_SSH_PORT,
    GIT_SSH_HOST_KEY: raw.GIT_SSH_HOST_KEY,
    GIT_LFS_ENABLED: bool(raw.GIT_LFS_ENABLED, true),
    GIT_LFS_MAX_STORAGE: raw.GIT_LFS_MAX_STORAGE,
    GIT_MAX_PUSH_SIZE: raw.GIT_MAX_PUSH_SIZE,
    GIT_MAX_FILE_SIZE: raw.GIT_MAX_FILE_SIZE,

    // Socket
    SOCKET_PORT: raw.SOCKET_PORT,

    // CORS
    CORS_ORIGINS: raw.CORS_ORIGINS,

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: raw.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: raw.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_AUTH_MAX_REQUESTS: raw.RATE_LIMIT_AUTH_MAX_REQUESTS,

    // Logging
    LOG_LEVEL: raw.LOG_LEVEL,
    LOG_FORMAT: raw.LOG_FORMAT,

    // OAuth
    GITHUB_CLIENT_ID: raw.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: raw.GITHUB_CLIENT_SECRET,
    GITHUB_ALLOWED_ORGS: raw.GITHUB_ALLOWED_ORGS,
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,
    GITLAB_CLIENT_ID: raw.GITLAB_CLIENT_ID,
    GITLAB_CLIENT_SECRET: raw.GITLAB_CLIENT_SECRET,
    GITLAB_URL: raw.GITLAB_URL,
    BITBUCKET_CLIENT_ID: raw.BITBUCKET_CLIENT_ID,
    BITBUCKET_CLIENT_SECRET: raw.BITBUCKET_CLIENT_SECRET,
    DISCORD_CLIENT_ID: raw.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: raw.DISCORD_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: raw.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: raw.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: raw.MICROSOFT_TENANT_ID,
    OIDC_ISSUER: raw.OIDC_ISSUER,
    OIDC_CLIENT_ID: raw.OIDC_CLIENT_ID,
    OIDC_CLIENT_SECRET: raw.OIDC_CLIENT_SECRET,

    // Feature flags (with SELF_HOSTED-dependent defaults)
    OAUTH_ENABLED: bool(raw.GITHUB_CLIENT_ID !== undefined ? "true" : "false", false),
    WEBHOOKS_ENABLED: bool(raw.WEBHOOK_ENABLED, true),
    WIKI_ENABLED: bool(raw.WIKIS_ENABLED, true),
    INSIGHTS_ENABLED: bool(raw.INSIGHTS_ENABLED, true),
    ADMIN_ENABLED: bool(raw.ADMIN_ENABLED, true),
    CODESPACES_ENABLED: bool(raw.CODESPACES_ENABLED, !selfHosted),
    AI_SEARCH_ENABLED: bool(raw.AI_SEARCH_ENABLED, false),
    PACKAGES_ENABLED: bool(raw.PACKAGES_ENABLED, true),
    ACTIONS_ENABLED: bool(raw.ACTIONS_ENABLED, true),
    ANALYTICS_ENABLED: bool(raw.ANALYTICS_ENABLED, !selfHosted),
    REGISTRATION_ENABLED: bool(raw.REGISTRATION_ENABLED, true),
    REGISTRATION_INVITE_ONLY: bool(raw.REGISTRATION_INVITE_ONLY, false),
    REGISTRATION_DOMAIN_WHITELIST: raw.REGISTRATION_DOMAIN_WHITELIST,
    WIKIS_ENABLED: bool(raw.WIKIS_ENABLED, true),
    DISCUSSIONS_ENABLED: bool(raw.DISCUSSIONS_ENABLED, true),
    PROJECTS_ENABLED: bool(raw.PROJECTS_ENABLED, true),
    PAGES_ENABLED: bool(raw.PAGES_ENABLED, false),
    CI_ENABLED: bool(raw.CI_ENABLED, true),

    // CI / Actions
    CI_RUNNER_CONCURRENCY: raw.CI_RUNNER_CONCURRENCY,
    CI_JOB_TIMEOUT_MINUTES: raw.CI_JOB_TIMEOUT_MINUTES,
    CI_ARTIFACT_RETENTION_DAYS: raw.CI_ARTIFACT_RETENTION_DAYS,
    CI_LOG_RETENTION_DAYS: raw.CI_LOG_RETENTION_DAYS,
    CI_DEFAULT_CONTAINER_IMAGE: raw.CI_DEFAULT_CONTAINER_IMAGE,

    // Codespaces
    CODESPACE_DEFAULT_MACHINE: raw.CODESPACE_DEFAULT_MACHINE,
    CODESPACE_MAX_MACHINE: raw.CODESPACE_MAX_MACHINE,
    CODESPACE_IDLE_TIMEOUT_MINUTES: raw.CODESPACE_IDLE_TIMEOUT_MINUTES,
    CODESPACE_MAX_LIFETIME_HOURS: raw.CODESPACE_MAX_LIFETIME_HOURS,
    CODESPACE_STORAGE_LIMIT_GB: raw.CODESPACE_STORAGE_LIMIT_GB,
    CODESPACE_CONTAINER_IMAGE: raw.CODESPACE_CONTAINER_IMAGE,
    CODESPACE_DOCKER_NETWORK: raw.CODESPACE_DOCKER_NETWORK,

    // Webhooks
    WEBHOOK_MAX_RETRIES: raw.WEBHOOK_MAX_RETRIES,
    WEBHOOK_TIMEOUT_SECONDS: raw.WEBHOOK_TIMEOUT_SECONDS,
    WEBHOOK_PAYLOAD_SIZE_LIMIT_KB: raw.WEBHOOK_PAYLOAD_SIZE_LIMIT_KB,

    // Upload
    UPLOAD_MAX_FILE_SIZE_MB: raw.UPLOAD_MAX_FILE_SIZE_MB,
    UPLOAD_ALLOWED_MIME_TYPES: raw.UPLOAD_ALLOWED_MIME_TYPES,

    // Admin
    ADMIN_USERNAMES: raw.ADMIN_USERNAMES,
    ADMIN_EMAILS: raw.ADMIN_EMAILS,

    // Monitoring
    METRICS_ENABLED: bool(raw.METRICS_ENABLED, false),
    METRICS_AUTH_TOKEN: raw.METRICS_AUTH_TOKEN,
    SENTRY_DSN: raw.SENTRY_DSN,
    SENTRY_ENVIRONMENT: raw.SENTRY_ENVIRONMENT,

    // AI / Copilot
    AI_PROVIDER: raw.AI_PROVIDER,
    AI_API_KEY: raw.AI_API_KEY,
    AI_MODEL: raw.AI_MODEL,
    AI_OPENAI_COMPATIBLE_URL: raw.AI_OPENAI_COMPATIBLE_URL,
    AI_MAX_TOKENS: raw.AI_MAX_TOKENS,
    AI_ENABLED: bool(raw.AI_ENABLED, false),

    // Supabase
    SUPABASE_URL: raw.SUPABASE_URL,
    SUPABASE_ANON_KEY: raw.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY,
  };
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
