# VETERAN - Phase Plan

> "Where code goes to war"
> Build the most comprehensive self-hosted Git platform

## Current Status: PHASE 1 COMPLETE (65%)

## PHASE 1: Foundation ✅ (Complete)
- [x] Project structure monorepo (shared/backend/frontend)
- [x] Prisma schema with 72 models (SQLite + PostgreSQL support)
- [x] Express backend with 23 route modules, 21 services
- [x] Auth system (register, login, JWT, sessions, 2FA structure)
- [x] Git protocol (Smart HTTP, SSH, LFS, hooks)
- [x] VeteranUI component library (20 components)
- [x] 45 frontend pages wired in router
- [x] Cloud/self-hosted mode toggle (SELF_HOSTED env var)
- [x] AI Copilot backend + frontend (Ctrl+I)
- [x] Dockerfile, docker-compose, nginx, supervisor configs

---

## PHASE 2: Core Functionality (Current - 2 weeks)

### 2.1 Fix Frontend Data Flow
- [ ] Fix `useRepo`/`useRepos` to handle both camelCase and snake_case backend responses
- [ ] Ensure all TanStack Query hooks properly invalidate and refetch
- [ ] Add better error handling for expired tokens (auto-redirect to login)
- [ ] Fix all API endpoint files to match backend routes exactly
- [ ] Ensure API client properly forwards auth headers for all requests

### 2.2 Complete CRUD Operations
- [ ] **Issues**: Create, edit, close, reopen, assign, label, milestone
- [ ] **Pull Requests**: Create, edit, merge (merge/squash/rebase), close, reopen
- [ ] **Comments**: Create, edit, delete on issues and PRs
- [ ] **Branches**: Create, delete, rename, set default
- [ ] **Tags**: Create, delete (lightweight + annotated)
- [ ] **Releases**: Create, edit, delete, publish/unpublish, upload assets
- [ ] **Wiki**: Create, edit, delete pages, page history
- [ ] **Projects**: Create, edit, delete columns and cards

### 2.3 Repository Features
- [ ] File viewer with syntax highlighting for all languages
- [ ] In-browser editor (Monaco) with commit dialog
- [ ] Create/delete/rename files via browser
- [ ] File blame view
- [ ] Commit history with graph visualization
- [ ] Branch comparison view (/compare)
- [ ] Clone dialog (HTTPS/SSH URLs)
- [ ] Download ZIP/TAR.GZ
- [ ] Star/watch/fork buttons with counts
- [ ] Repository topics/tags management

### 2.4 Repository Settings
- [ ] General: rename, description, visibility, archive, delete
- [ ] Collaborators: add/remove, permission levels
- [ ] Branches: protection rules UI
- [ ] Webhooks: create/edit/delete, delivery log
- [ ] Deploy keys: add/remove
- [ ] Secrets: create/edit/delete
- [ ] Environments: create/edit/delete
- [ ] Feature toggles (wiki, issues, projects, etc.)

---

## PHASE 3: Advanced Features (2 weeks)

### 3.1 Search
- [ ] Global search bar (Cmd+K or /)
- [ ] Repository search with filters (stars, language, pushed)
- [ ] Code search (full-text, file path, extension)
- [ ] Issue/PR search with GitHub-style syntax
- [ ] User search
- [ ] Search results page with categories

### 3.2 Notifications
- [ ] Real-time notification bell (Socket.io)
- [ ] Notification inbox with filtering
- [ ] Mark read / mark all read
- [ ] Watch repository with levels
- [ ] Email notification templates rendered properly

### 3.3 Admin Panel
- [ ] Dashboard with real stats (users, repos, storage)
- [ ] User management (search, suspend, delete, impersonate)
- [ ] Repository management (search, delete, transfer)
- [ ] Organization management
- [ ] Site settings (name, description, registration, maintenance mode)
- [ ] Authentication settings (OAuth providers, 2FA enforcement)
- [ ] Email/SMTP configuration UI
- [ ] Storage management (quotas, cleanup)
- [ ] Audit log viewer with filters
- [ ] Monitoring (system health, queue stats, error rates)

### 3.4 Organizations
- [ ] Org creation flow
- [ ] Org profile page (pinned repos, README, members)
- [ ] Org settings (billing, permissions, SSO)
- [ ] Team management (create, edit, delete, members)
- [ ] Team repository access control
- [ ] Audit log

---

## PHASE 4: CI/CD & DevOps (2 weeks)

### 4.1 Actions/CI
- [ ] Workflow YAML editor with syntax highlighting
- [ ] Workflow run list with filtering
- [ ] Run detail page with job DAG visualization
- [ ] Live log streaming (SSE/WebSocket)
- [ ] Job re-run / cancel
- [ ] Artifact browser
- [ ] Self-hosted runner registration UI
- [ ] Usage minutes dashboard

### 4.2 Codespaces
- [ ] Codespace creation form (machine type, branch)
- [ ] Codespace list with status indicators
- [ ] Start/stop/delete codespace
- [ ] VS Code in-browser IDE integration
- [ ] Port forwarding UI
- [ ] Resource usage display

### 4.3 Packages
- [ ] Package list with version selector
- [ ] npm registry publish UI
- [ ] Docker registry UI
- [ ] Package version management
- [ ] Download statistics
- [ ] Vulnerability badges

---

## PHASE 5: AI & Quality (1 week)

### 5.1 AI Copilot
- [ ] Code completion in Monaco editor
- [ ] AI-powered code review on PRs
- [ ] AI commit message generation
- [ ] AI issue/PR description generation
- [ ] AI search (natural language code search)
- [ ] Chat with repo context

### 5.2 Testing & Quality
- [ ] Backend unit tests for all services (Vitest)
- [ ] Backend integration tests for API endpoints (Supertest)
- [ ] Frontend unit tests for components (Vitest)
- [ ] E2E tests for critical paths (Playwright):
  - Sign up, verify email, login, logout
  - Create repo, push via HTTP, view file
  - Create issue, comment, close
  - Create PR, review, merge
  - Run workflow, view logs
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Bundle size optimization
- [ ] Lighthouse audit (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### 5.3 Polish
- [ ] Light mode theme (toggle)
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Keyboard shortcuts cheatsheet (?)
- [ ] Responsive design (mobile support)
- [ ] PWA support (offline, install prompt)
- [ ] i18n (English + placeholder for expansion)
- [ ] Custom error pages (403, 404, 500)

---

## PHASE 6: Deployment & Docs (1 week)

### 6.1 Deployment
- [ ] Production Docker image optimization
- [ ] Kubernetes manifests
- [ ] CI/CD GitHub Actions workflow
- [ ] Self-hosted setup script
- [ ] Backup/restore procedures
- [ ] Monitoring (Prometheus + Grafana)

### 6.2 Documentation
- [ ] Complete README with setup guide
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Admin guide
- [ ] User guide
- [ ] Developer contributing guide
- [ ] Security policy

---

## Backend API Endpoints Status

| Group | Routes | Status |
|-------|--------|--------|
| Auth | /register, /login, /logout, /me, /refresh, /password, /verify-email, /forgot-password, /reset-password | ✅ Working |
| Repos | CRUD, star, watch, forks, branches, tags, commits, contents, readme, compare | ✅ Working |
| Issues | List, create, get, update, comments | ✅ Working |
| Pulls | List, create, get, update, merge, commits, files, reviews, comments | ✅ Working |
| Search | repos, issues, code, users, topics | ⚠️ Working |
| Admin | stats, users, repos, settings, announcements | ⚠️ Working |
| Notifications | List, unread count, mark read, subscriptions | ✅ Working |
| Wiki | List, get, create, update, delete | ⚠️ Working |
| Projects | List, create, get, update, columns, cards | ⚠️ Working |
| Discussions | List, create, get, comments, vote | ⚠️ Working |
| Actions | Workflows, runs, jobs, logs, artifacts | ✅ Working |
| Codespaces | CRUD, start, stop, ports | ✅ Working |
| Packages | List, get, versions, npm publish | ⚠️ Working |
| Organizations | CRUD, members, teams, repos | ⚠️ Working |
| AI | chat, complete, review, status | ✅ Working |
| Git | info/refs, upload-pack, receive-pack | ✅ Working |
| LFS | batch, objects, verify, locks | ✅ Working |

## Frontend Pages Status

| Page | Route | Status |
|------|-------|--------|
| Landing | / | ✅ Built |
| Login | /login | ✅ Working |
| Signup | /signup | ✅ Working |
| Dashboard | /dashboard | ⚠️ Needs real data |
| Explore | /explore | ⚠️ Needs real data |
| Create Repo | /new | ✅ Working |
| Repo Code | /:owner/:repo | ⚠️ Working but needs polish |
| Repo Issues | /:owner/:repo/issues | ⚠️ Working |
| Repo Issue Detail | /:owner/:repo/issues/:number | ⚠️ Working |
| Create Issue | /:owner/:repo/issues/new | ✅ New |
| Repo Pulls | /:owner/:repo/pulls | ⚠️ Working |
| Repo Pull Detail | /:owner/:repo/pull/:number | ⚠️ Working |
| Create PR | /:owner/:repo/pulls/new | ✅ New |
| Repo Commits | /:owner/:repo/commits | ⚠️ Working |
| Repo Branches | /:owner/:repo/branches | ⚠️ Working |
| Repo Releases | /:owner/:repo/releases | ⚠️ Working |
| Repo Actions | /:owner/:repo/actions | ⚠️ Working |
| Repo Wiki | /:owner/:repo/wiki | ⚠️ Working |
| Repo Security | /:owner/:repo/security | ⚠️ Working |
| Repo Insights | /:owner/:repo/insights | ⚠️ Working |
| Repo Settings | /:owner/:repo/settings | ⚠️ Working |
| Notifications | /notifications | ⚠️ Working |
| Codespaces | /codespaces | ⚠️ Working |
| Admin Dashboard | /admin | ⚠️ Working |
| Admin Users | /admin/users | ⚠️ Working |
| Admin Repos | /admin/repos | ⚠️ Working |
| Admin Orgs | /admin/orgs | ⚠️ Working |
| User Settings | /settings | ⚠️ Working |
| Org Profile | /:org | ⚠️ Working |
| Org Settings | /:org/settings | ⚠️ Working |
| User Profile | /:username | ⚠️ Working |

## Key Technical Debt

1. **Prisma relations stripped** - All relations were removed for SQLite compatibility. Need to add them back properly with separate migration for PostgreSQL.
2. **Backend routes use `@ts-nocheck`** - Many route files have type checking disabled. Need to fix types properly.
3. **API response format** - Backend returns raw objects, frontend expects `{ data, error, meta }` envelope.
4. **Error handling** - Need consistent error handling across all frontend pages.
5. **No pagination in frontend** - Lists don't paginate properly.
6. **No file upload** - Avatar upload, release assets not implemented.
7. **No real-time** - Socket.io connected but pages don't subscribe to events.
8. **Auth token refresh** - Auto-refresh on 401 works but may need better handling.
