# 🪖 VETERAN — Where code goes to war

> The most comprehensive self-hosted Git platform ever built. A fully-featured GitHub/GitLab alternative with repositories, pull requests, issues, CI/CD, codespaces, package registry, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://hub.docker.com)
[![Node](https://img.shields.io/badge/node-20-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)](https://www.typescriptlang.org)

---

## ✨ Features

- **📁 Repositories** — Full Git Smart HTTP + SSH support, file viewer with syntax highlighting, blame view, commit history graph, branch management, protected branches, releases with assets
- **🔀 Pull Requests** — Code reviews with inline comments, suggested changes, approval workflows, merge strategies (merge commit, squash, rebase), auto-merge
- **🐛 Issues** — Rich markdown editor with @mentions and #references, labels with colors, milestones, project boards, issue templates, reactions
- **⚡ Actions (CI/CD)** — GitHub Actions-compatible YAML pipelines, matrix builds, caching, artifacts, self-hosted runners, marketplace
- **💻 Codespaces** — Cloud development environments, VS Code in browser, devcontainer.json support, port forwarding, prebuilds
- **📦 Package Registry** — npm registry, Docker registry (OCI-compliant), with stubs for RubyGems, PyPI, Maven, NuGet, Cargo, Helm
- **🗺️ Projects** — Kanban boards, table view, Gantt-style roadmap with custom fields, automation rules
- **📖 Wiki** — Git-backed wiki per repository, GFM rendering, page history, diffs
- **💬 Discussions** — Category-based discussions, Q&A with answer marking, polls, announcements
- **🏢 Organizations** — Teams with hierarchy, fine-grained permissions, SAML SSO, audit log
- **🔒 Security** — Dependency graph, Dependabot-style alerts, secret scanning, security advisories, private vulnerability reporting
- **📊 Insights** — Pulse, contributor stats, traffic analytics, commit frequency heatmap, code frequency, network graph, dependency graph
- **🔐 Authentication** — Email + password, OAuth (GitHub, Google, GitLab, Bitbucket, Discord, Microsoft), 2FA (TOTP, WebAuthn), passkeys, SAML SSO
- **🔌 Integrations** — Webhooks, API tokens with fine-grained scopes, OAuth apps, marketplace

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          NGINX (Port 7860)                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Frontend │  │ API Proxy    │  │ WebSocket│  │ Git HTTP  │  │
│  │ Static   │  │ /api/*       │  │ /socket  │  │ *.git/*   │  │
│  └──────────┘  └──────┬───────┘  └────┬─────┘  └─────┬─────┘  │
└───────────────────────┼──────────────┼───────────────┼──────────┘
                        │              │               │
┌───────────────────────┼──────────────┼───────────────┼──────────┐
│                  Express Backend (Port 3000)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ REST API │ │Git Smart │ │ Socket   │ │ Background Worker │  │
│  │ Controllers│ │ HTTP/SSH │ │ .io Server│ │ (BullMQ Queue)   │  │
│  └─────┬────┘ └────┬─────┘ └────┬─────┘ └────────┬──────────┘  │
│        │           │            │                 │              │
│  ┌─────┴───────────┴────────────┴─────────────────┴──────────┐  │
│  │                   Prisma ORM                                │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    PostgreSQL + Redis                             │
│  ┌─────────────────┐  ┌──────────────────────┐                   │
│  │  PostgreSQL 16   │  │      Redis 7          │                   │
│  │  (Primary DB)    │  │  (Cache + Queue +     │                   │
│  │                  │  │   Realtime + Sessions) │                   │
│  └─────────────────┘  └──────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/veteran.git
cd veteran

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start with Docker Compose
docker compose up -d

# 4. Open in browser
open http://localhost:7860
```

### Ports

| Port | Service     | Description              |
|------|-------------|--------------------------|
| 7860 | HTTP/HTTPS  | Web UI + API + Git HTTP  |
| 2222 | SSH         | Git SSH operations       |
| 4873 | Registry    | npm package registry     |
| 5432 | PostgreSQL  | Database (internal)      |
| 6379 | Redis       | Cache/Queue (internal)   |

---

## 📦 Manual Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git 2.30+

### Install

```bash
# Install dependencies
npm ci

# Build shared package
npm run build:shared

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build backend and frontend
npm run build

# Start development servers
npm run dev
```

### Environment Variables

See [.env.example](.env.example) for a complete list of all configuration variables with documentation.

Key variables:

| Variable             | Description                    | Default                    |
|----------------------|--------------------------------|----------------------------|
| `DATABASE_URL`       | PostgreSQL connection string   | `postgresql://...`         |
| `REDIS_URL`          | Redis connection string        | `redis://localhost:6379`   |
| `APP_URL`            | Public-facing URL              | `http://localhost:7860`    |
| `APP_SECRET`         | Encryption secret              | (required)                 |
| `JWT_SECRET`         | JWT signing secret             | (required)                 |
| `GITHUB_CLIENT_ID`   | GitHub OAuth App ID            | (optional)                 |
| `SMTP_HOST`          | Email server host              | (optional)                 |

---

## 📁 Project Structure

```
veteran/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── config/           # App configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── emails/           # React Email templates
│   │   ├── middleware/       # Auth, validation, rate-limit
│   │   ├── prisma/           # Schema + migrations + seed
│   │   ├── realtime/         # Socket.io event handlers
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── ssh/              # SSH server implementation
│   │   ├── utils/            # Shared utilities
│   │   └── workers/          # BullMQ background jobs
│   └── tests/
├── frontend/                 # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route pages
│   │   ├── stores/           # Zustand stores
│   │   ├── lib/              # Utilities
│   │   └── styles/           # Global CSS
│   └── tests/
├── packages/
│   └── shared/               # Shared types, schemas, utilities
├── data/                     # Runtime data (repos, uploads, etc.)
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Dev services (DB + Redis)
├── nginx.conf                # Reverse proxy configuration
├── supervisord.conf          # Process manager config
└── .env.example              # Environment variable reference
```

---

## 🛠️ Development

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
npm ci

# Run database migrations
npm run db:migrate

# Start dev servers (backend + frontend with hot reload)
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

### Available Scripts

| Script              | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start backend + frontend dev servers |
| `npm run build`     | Build all packages                  |
| `npm run start`     | Start production backend            |
| `npm test`          | Run all tests                       |
| `npm run lint`      | Lint all packages                   |
| `npm run typecheck` | TypeScript type checking            |
| `npm run db:migrate`| Run database migrations             |
| `npm run db:seed`   | Seed database with sample data      |

---

## 🚢 Deployment

### Docker (recommended)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Kubernetes

Kubernetes manifests are available in the `k8s/` directory for production deployments with scaling, rolling updates, and service discovery.

### Environment-Specific Configuration

For production deployments, ensure you:

1. Set strong `APP_SECRET` and `JWT_SECRET` values (64+ random characters)
2. Configure `DATABASE_URL` with a managed PostgreSQL instance
3. Set `APP_URL` to your public domain
4. Enable HTTPS (via reverse proxy like Traefik, Caddy, or a cloud LB)
5. Set up SMTP credentials for email notifications
6. Configure OAuth providers as needed
7. Adjust `GIT_SSH_PORT` if port 2222 is not available

---

## 📖 API Documentation

API documentation is available at `/api/docs` when the server is running. The API follows RESTful conventions with JSON request/response bodies and uses JWT bearer tokens for authentication.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -am 'feat: add awesome feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 📄 License

MIT © VETERAN Contributors

---

<p align="center">Built with ❤️ for developers who demand more from their Git platform.</p>
