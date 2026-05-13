╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                  ║
║   🪖 VETERAN — GODMODE BUILD PROMPT v1.0                                        ║
║   The most comprehensive self-hosted Git platform ever built                     ║
║   "Build what GitHub wished it was"                                              ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝

You are the world's greatest full-stack engineer, systems architect, DevOps engineer,
security expert, and product designer combined. You have infinite context, infinite
patience, and zero tolerance for placeholder code, TODOs, mock data, or incomplete
implementations. Every single line of code you write is production-ready,
fully functional, and battle-tested.

You are building VETERAN — a self-hosted, open-source Git platform that surpasses
GitHub in features, performance, and developer experience. This is not a demo.
This is not an MVP. This is the complete, final, shippable product.

ABSOLUTE RULES — NEVER VIOLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Never write placeholder code or comments like "// implement this later"
✗ Never write "TODO", "FIXME", "coming soon", or "not implemented"
✗ Never use mock/fake data — all data comes from real API/database calls
✗ Never skip error handling — every async operation has try/catch
✗ Never skip loading states — every async UI has skeleton loaders
✗ Never skip validation — every form has client AND server side validation
✗ Never skip types — full TypeScript strict mode throughout
✗ Never skip tests for critical paths (auth, git operations, payments)
✗ If a feature is listed, it MUST be fully built and working end-to-end

═══════════════════════════════════════════════════════════════════════════════════
🎨  BRAND & DESIGN SYSTEM
═══════════════════════════════════════════════════════════════════════════════════

Platform Name: VETERAN
Tagline: "Where code goes to war"
Logo: Military dog tag icon — minimalist, geometric
Visual Identity:
  - Primary Dark: #0A0C10 (near-black background)
  - Surface: #13161E (card backgrounds)
  - Border: #21262D (subtle borders)
  - Accent: #E8B84B (military gold — primary CTA color)
  - Success: #3FB950
  - Danger: #F85149
  - Warning: #D29922
  - Info: #58A6FF
  - Text Primary: #E6EDF3
  - Text Secondary: #8B949E
  - Text Muted: #484F58

Typography:
  - Display: "Cal Sans" or "Mona Sans" (GitHub's newer font)
  - Body: "Inter" 
  - Code: "JetBrains Mono" or "Fira Code" with ligatures

Design Principles:
  - Pixel-perfect dark mode (light mode optional toggle)
  - GitHub-inspired layout but cleaner, more modern
  - Linear.app-level polish on interactions
  - Micro-animations on every interactive element (Framer Motion)
  - Glass-morphism accents on modals and overlays
  - Consistent 8px grid spacing system
  - Fluid typography (clamp-based responsive)
  - Custom scrollbars matching theme
  - Smooth page transitions
  - Command palette (Cmd+K) accessible from anywhere
  - Keyboard shortcuts system with cheatsheet modal (?)
  - Right-click context menus on file tree items
  - Drag handles on resizable panels
  - Collapsible sidebar
  - Full WCAG 2.1 AA accessibility
  - Reduced motion support (prefers-reduced-motion)
  - High contrast mode support

Component Library:
  Build a fully custom component library using shadcn/ui as base, extended with:
  - VeteranButton (variants: primary, secondary, danger, ghost, outline, gold)
  - VeteranInput (with icons, validation states, character count)
  - VeteranBadge (repo visibility, PR status, issue state, build status)
  - VeteranAvatar (with status dot, fallback initials, group stack)
  - VeteranTooltip (rich tooltips with delay, arrow, max-width)
  - VeteranDropdown (with sections, icons, keyboard nav, search)
  - VeteranModal (with sizes, backdrop blur, close on escape)
  - VeteranTabs (underline and pill variants)
  - VeteranMarkdown (full GFM rendering with task lists, tables, alerts)
  - VeteranCodeBlock (syntax highlighted, copy button, filename display)
  - VeteranDiff (unified and split modes, expand context, comment threads)
  - VeteranFileTree (lazy-loaded, icons per file type, context menu)
  - VeteranContribGraph (52-week heatmap, tooltip on hover, color levels)
  - VeteranSkeleton (animated loading placeholders for every component)
  - VeteranEmptyState (icon, title, description, CTA per context)
  - VeteranPagination (cursor-based with page size selector)
  - VeteranSearchBar (with filters, suggestions, recent searches)
  - VeteranTimeline (event list with icons and threading)
  - VeteranKanban (drag-and-drop board with column management)
  - VeteranEditor (Monaco-based with language detection, themes, vim mode)

═══════════════════════════════════════════════════════════════════════════════════
🏗️  ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════════

HYBRID BACKEND STRATEGY:
┌─────────────────────────────────────────────────────────────┐
│                    VETERAN PLATFORM                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   SUPABASE BaaS  │    │   CUSTOM EXPRESS BACKEND     │   │
│  │                  │    │                              │   │
│  │ ✓ PostgreSQL DB  │    │ ✓ Git Smart HTTP Protocol   │   │
│  │ ✓ Auth + OAuth   │    │ ✓ SSH Git Server (port 22)  │   │
│  │ ✓ Row-Level Sec  │    │ ✓ Bare Repo Management      │   │
│  │ ✓ File Storage   │    │ ✓ Git Hooks System          │   │
│  │ ✓ Realtime WS    │    │ ✓ Codespace Orchestration   │   │
│  │ ✓ Edge Functions │    │ ✓ CI/CD Pipeline Runner     │   │
│  │ ✓ Vault Secrets  │    │ ✓ Package Registry          │   │
│  │ ✓ Vector Search  │    │ ✓ Webhook Dispatcher        │   │
│  └─────────────────┘    │ ✓ LFS Server                │   │
│                          │ ✓ Background Job Queue       │   │
│                          └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

FRONTEND TECH STACK:
  Framework:     Next.js 14 App Router + TypeScript (strict)
  Styling:       TailwindCSS + CSS Variables for theming
  Components:    shadcn/ui (base) + custom VeteranUI library
  Animations:    Framer Motion + CSS transitions
  State:         Zustand (client) + TanStack Query (server)
  Forms:         React Hook Form + Zod resolvers
  Editor:        Monaco Editor (code editing everywhere)
  Rich Text:     TipTap editor (issue/PR descriptions)
  Charts:        Recharts + D3.js for complex visualizations
  3D/Canvas:     Three.js for contribution globe
  Tables:        TanStack Table (virtualized for large datasets)
  DnD:           @dnd-kit/core (kanban boards, file upload)
  Markdown:      react-markdown + remark-gfm + rehype-highlight
  Diff:          diff2html (PR diffs, commit diffs)
  Icons:         Lucide React + custom SVG icon set
  Dates:         date-fns
  Hotkeys:       @github/hotkey or react-hotkeys-hook
  Virtualize:    TanStack Virtual (large lists)
  Image:         next/image + Plaiceholder for blur placeholders
  i18n:          next-intl (English + placeholder for expansion)
  PWA:           next-pwa (offline support, install prompt)
  Analytics:     PostHog (self-hosted, privacy-first)
  Error Track:   Sentry (self-hosted)
  Testing:       Vitest + Testing Library + Playwright (E2E)

BACKEND TECH STACK:
  Runtime:       Node.js 20 LTS
  Framework:     Express 5 + TypeScript (strict)
  ORM:           Prisma (with Supabase PostgreSQL)
  Validation:    Zod (shared schemas with frontend)
  Auth:          Supabase Auth + custom JWT for git operations
  Queue:         BullMQ + Redis (job processing)
  Cache:         Redis (response cache, rate limit, sessions)
  Search:        PostgreSQL FTS (tsvector) + pgvector for AI search
  Git:           Native git binary + nodegit for advanced ops
  SSH:           ssh2 library (custom SSH server)
  Email:         Nodemailer + React Email templates
  Realtime:      Supabase Realtime + Socket.io (git push events)
  Storage:       Supabase Storage (avatars, assets) + local (/data)
  Logging:       Winston + Pino (structured JSON logs)
  Monitoring:    Prometheus metrics + Grafana dashboard
  Security:      Helmet + express-rate-limit + cors + csurf
  Process:       PM2 (multi-process clustering)
  Testing:       Vitest + Supertest

DATABASE (Supabase PostgreSQL):
  Full Prisma schema with tables for:
  users, sessions, oauth_accounts, ssh_keys, api_tokens,
  organizations, org_members, teams, team_members, team_repos,
  repositories, repo_collaborators, repo_topics,
  branches, branch_protections, tags, releases, release_assets,
  commits, commit_statuses, check_runs, check_suites,
  issues, issue_comments, issue_reactions, issue_labels,
  issue_milestones, issue_assignees, issue_events,
  pull_requests, pr_reviews, pr_review_comments, pr_review_events,
  pr_commits, pr_check_results,
  webhooks, webhook_deliveries,
  notifications, notification_subscriptions,
  discussions, discussion_comments, discussion_votes,
  stars, watches, forks, followers,
  wiki_pages, wiki_revisions,
  projects, project_columns, project_cards,
  codespaces, codespace_ports,
  ci_pipelines, ci_jobs, ci_job_logs, ci_artifacts,
  packages, package_versions, package_downloads,
  audit_logs, admin_settings, site_announcements,
  search_indexes, repo_traffic, repo_clones,
  contributor_stats, code_frequency, punch_card_stats,
  lfs_objects, lfs_locks,
  integrations, integration_installations, integration_permissions,
  marketplace_apps, marketplace_reviews

INFRASTRUCTURE:
  Container:     Single Docker container (multi-stage build)
  Proxy:         Nginx (frontend, API, git HTTP, static assets)
  Process Mgr:   Supervisord (nginx + node backend + background workers)
  Persistent:    /data directory (git repos, uploads, DB backups, LFS)
  Environment:   .env with 50+ documented variables
  Health:        GET /health + GET /ready endpoints
  Metrics:       GET /metrics (Prometheus format)
  Deploy:        docker-compose.yml + Kubernetes manifests (optional)
  CI:            GitHub Actions workflow for building/pushing image
  Ports:         7860 (web), 2222 (SSH), 4873 (npm registry)

═══════════════════════════════════════════════════════════════════════════════════
🔐  AUTHENTICATION & IDENTITY
═══════════════════════════════════════════════════════════════════════════════════

SIGN UP / SIGN IN:
  - Register: username, email, password (zxcvbn strength meter)
  - Login: username or email + password
  - Remember me (30-day persistent session)
  - Email verification (required before first push)
  - Welcome email on signup (React Email template)
  - Password reset via email (1-hour token)
  - Magic link login option
  - Passkey support (WebAuthn / FIDO2) — passwordless login
  
OAUTH PROVIDERS (fully configurable via env):
  - GitHub (primary — import repos directly after login)
  - Google
  - GitLab
  - Bitbucket
  - Microsoft (Azure AD)
  - Discord
  - Generic OIDC provider support
  - SAML 2.0 for enterprise SSO
  
2FA / MFA:
  - TOTP (Google Authenticator, Authy compatible)
  - SMS via Twilio (optional)
  - WebAuthn hardware key (YubiKey support)
  - Recovery codes (8 one-time backup codes)
  - 2FA enforcement per org
  
SESSION MANAGEMENT:
  - View all active sessions (device, browser, IP, location, last active)
  - Revoke individual sessions
  - Revoke all other sessions ("sign out everywhere")
  - Session activity timeline
  
API TOKENS:
  - Create named tokens with expiry dates (1 day to never)
  - Fine-grained scopes:
    repo:read, repo:write, repo:admin
    issues:read, issues:write
    pulls:read, pulls:write
    user:read, user:write
    org:read, org:write
    packages:read, packages:write
    codespaces:read, codespaces:write
    admin:site (superadmin only)
  - Last used timestamp per token
  - Token usage log (last 100 API calls)
  - Revoke instantly
  
SSH KEYS:
  - Add multiple SSH public keys
  - Key fingerprint display (SHA256)
  - Key type display (RSA, Ed25519, ECDSA)
  - Last used timestamp
  - Deploy keys (repo-scoped, read-only or read-write)
  - Named keys with descriptions

USER PROFILES:
  - Avatar: upload with crop/zoom tool OR Gravatar OR initials fallback
  - Display name (separate from username)
  - Bio (supports emoji + limited markdown)
  - Pronouns (free text)
  - Website URL (validated, shown with link icon)
  - Location (free text)
  - Company/organization affiliation
  - Social links: Twitter/X, LinkedIn, Mastodon, YouTube, Twitch
  - Profile README: special repo username/username auto-renders on profile
  - Contribution graph (52-week heatmap with daily tooltip)
  - Contribution globe (3D globe — Three.js — showing commit geography)
  - Pinned repos (up to 6, drag to reorder)
  - Achievement badges (first commit, first PR, 100 stars received, etc.)
  - Follower/following counts with paginated lists
  - Public activity feed (commits, PRs opened, issues, stars given)
  - Customizable activity feed privacy (show/hide per activity type)
  - Joined date
  - "Available for hire" badge
  - Sponsor button (configurable)

═══════════════════════════════════════════════════════════════════════════════════
📁  REPOSITORY SYSTEM
═══════════════════════════════════════════════════════════════════════════════════

CREATION:
  - Name (validated: alphanumeric, hyphens, underscores, 1-100 chars)
  - Description (optional, 350 char limit)
  - Visibility: Public / Private / Internal (org-only)
  - Initialize with README (auto-generated from name + description)
  - Add .gitignore (template picker: 50+ languages/frameworks)
  - Add license (picker: MIT, Apache, GPL, BSD, ISC, Unlicense, etc.)
  - Add default branch name override (default: "main")
  - Create from template (if template repos exist)
  - Import from URL (clone external git repo into Veteran)

REPOSITORY PAGE (/:owner/:repo):
  Primary navigation tabs:
  Code | Issues | Pull Requests | Actions | Projects | Wiki | 
  Security | Insights | Packages | Settings

  Code tab:
  - Branch/tag switcher dropdown (searchable, shows ahead/behind)
  - "Go to file" button (opens fuzzy file finder)
  - Clone URL display (HTTPS / SSH / CLI) with copy buttons
  - Download ZIP / TAR.GZ buttons
  - Star button with count (animated star fill on click)
  - Watch button (with notification level dropdown)
  - Fork button with count (shows fork network)
  - Sponsor button (if configured)
  - About section (description, website, topics, license, stars, forks, watchers)
  - Topics/tags (clickable, link to explore by topic)
  - README.md rendered below file tree
  - File tree with:
    - Folder/file icons (Seti file icon theme — 100+ specific icons)
    - Last commit message per row (truncated with tooltip)
    - Last commit time (relative + absolute on hover)
    - File size (on files)
    - Lazy loading for large trees
    - Search/filter files in current directory
    - Right-click context menu (copy path, copy permalink, view history)

FILE VIEWER:
  - Syntax highlighting (highlight.js — 200+ languages, auto-detected)
  - Line numbers (clickable to highlight + create permalink)
  - Line range selection (click first line, shift-click last — #L10-L25 URL)
  - Raw view button
  - Download button
  - Copy raw content button
  - Edit in browser button (opens Monaco editor)
  - View file history button
  - Blame view button
  - File stats: lines, size, encoding, EOL style
  - Binary file handling (hex view for small binaries, download for large)
  - Image preview (png, jpg, gif, svg, webp)
  - PDF preview (in-browser PDF.js renderer)
  - Notebook preview (Jupyter .ipynb rendered)
  - CSV preview (tabular display with sorting)
  - Markdown preview (rendered) + source toggle
  - SVG preview + source toggle
  - Video preview (mp4, webm)
  - Audio preview (mp3, wav, ogg)
  - 3D model preview (STL, OBJ — Three.js renderer)
  - LFS pointer display with download link for LFS files

IN-BROWSER EDITOR:
  - Monaco Editor (VS Code engine)
  - Language auto-detection
  - Themes: VS Code Dark, Dracula, Nord, One Dark, Monokai
  - Font size control
  - Word wrap toggle
  - Vim mode toggle
  - Minimap toggle
  - Format on save (Prettier for supported languages)
  - Commit dialog:
    - Commit message (required)
    - Extended description (optional)
    - Commit to current branch OR create new branch + PR
    - Co-author field
    - Sign commit option (if GPG configured)
  - Create new file (path input supports nested path creation)
  - Upload files (drag-and-drop, multiple, max size configurable)
  - Delete file (with commit message)
  - Rename/move file (with commit message)

BLAME VIEW:
  - Line-by-line attribution
  - Heat map coloring (older = more faded)
  - Hover to see full commit details (message, author, date, sha)
  - Click commit sha to navigate to commit
  - Click author to navigate to profile
  - Jump between blame blocks

FILE HISTORY:
  - Paginated list of commits that modified the file
  - Show diff for each commit
  - "Follow renames" toggle

COMMIT HISTORY:
  - Grouped by date (Today, Yesterday, Last week, etc.)
  - Avatar + name + time per commit
  - Commit message (title) with expandable body
  - SHA chip (click to copy, click link to commit page)
  - Verified badge (GPG signed commits)
  - Co-author avatars
  - Search commits (by message)
  - Filter by author
  - Filter by date range
  - Filter by path
  - Graph view (branching visualization, d3-based)
  - Commit count display

COMMIT DETAIL PAGE:
  - Full commit message (title + body)
  - Author info (avatar, name, email, date)
  - Committer info (if different from author)
  - GPG signature verification status + key ID
  - Parent commit(s) links
  - Full diff:
    - Stats bar (N files changed, X insertions, Y deletions)
    - Per-file diff with expand context controls
    - Unified and split diff modes
    - Syntax highlighted diffs
    - Image diffs (before/after slider for image changes)
    - Collapsed by default for large diffs (expand all button)
  - Add comment to specific lines (inline comments)
  - Comment on full commit (timeline at bottom)
  - Copy commit SHA
  - Browse repo at this commit
  - Revert commit button (creates new PR or direct push)
  - Cherry-pick button (onto selected branch)

BRANCHES:
  - List all branches (paginated, sorted: active, stale, all)
  - Per branch: last commit sha, message, author, time, ahead/behind default
  - Search branches
  - Create branch from current (name input + base selector)
  - Delete branch (with protection check)
  - Restore deleted branch (within 30 days)
  - Set default branch
  - Rename branch (with redirect)
  - Compare branch to another (/:owner/:repo/compare/base...compare)
  - Merge branch to another via UI
  - Sync fork branch with upstream

BRANCH PROTECTION RULES:
  - Match by branch name pattern (glob)
  - Require pull request before merging
    - Required approvals count (1-6)
    - Dismiss stale reviews on new push
    - Require review from code owners
    - Restrict who can dismiss reviews
    - Require approval of most recent reviewable push
  - Require status checks to pass
    - List specific required checks (CI jobs)
    - Require up-to-date branch before merging
  - Require conversation resolution before merging
  - Require signed commits
  - Require linear history
  - Restrict who can push to matching branches (users/teams allowlist)
  - Allow force pushes (specific users/teams only)
  - Allow deletions (specific users/teams only)
  - Lock branch (read-only for everyone)
  - Bypass allowlist for all restrictions

TAGS & RELEASES:
  - List all tags with sort (newest, oldest, semver)
  - Create lightweight tag (name + target)
  - Create annotated tag (name + message + tagger + target)
  - Delete tag (with confirmation)
  - PGP-signed tag verification display
  
  RELEASES:
  - Create release from tag
  - Auto-generate release notes (from merged PRs and commits since last release)
  - Rich markdown description (TipTap editor)
  - Attach binary assets (drag-and-drop upload, multiple files)
  - Asset download count per file
  - Mark as pre-release / draft
  - Publish / unpublish release
  - Edit release
  - Delete release
  - Subscribe to release notifications
  - RSS feed for releases (/:owner/:repo/releases.atom)
  - Latest release badge (/badge/latest-release)
  - Release comparison view

REPOSITORY SETTINGS:
  General:
  - Rename repository (with redirect from old name)
  - Change description, website, topics
  - Social preview image (OG image upload)
  - Change default branch
  - Template repository toggle
  - Require contributors to sign CLA
  - Archive repository (read-only, with unarchive option)
  - Change visibility (with impact warning and confirmation)
  - Transfer ownership (to user or org)
  - Delete repository (type repo name to confirm, email notification)
  
  Features toggles:
  - Wikis (enabled/disabled)
  - Issues (enabled/disabled + external issue tracker URL option)
  - Pull Requests merge options (merge commit, squash, rebase — enable/disable each)
  - Always suggest updating PR branches
  - Auto-delete head branches after merge
  - Discussions (enabled/disabled)
  - Projects (enabled/disabled)
  - Actions (enabled/disabled)
  - Packages (enabled/disabled)
  - Codespaces (enabled/disabled)
  
  Collaborators:
  - Add collaborators by username
  - Set permission level: Read, Triage, Write, Maintain, Admin
  - Remove collaborators
  - Pending invitations management
  
  Branches: (see Branch Protection Rules above)
  
  Webhooks: (see Webhooks section)
  
  Integrations:
  - Connect marketplace apps to repo
  - View installed integrations
  
  Deploy Keys:
  - Add SSH deploy keys (repo-scoped)
  - Read-only or read-write toggle
  
  Secrets & Variables:
  - Repository secrets (encrypted, for Actions)
  - Repository variables (plaintext, for Actions)
  - Environment-scoped secrets/variables
  
  Environments:
  - Create environments (production, staging, preview)
  - Required reviewers before deploy
  - Wait timer
  - Deployment branches whitelist
  - Environment secrets
  
  Code Security:
  - Dependency graph (enabled/disabled)
  - Dependabot alerts (enabled/disabled)
  - Secret scanning (enabled/disabled)
  - Code scanning (enabled/disabled)
  - Security advisories
  
  Pages:
  - Source: deploy from branch or Actions
  - Branch/folder selector
  - Custom domain with HTTPS enforcement
  - Visitor analytics

═══════════════════════════════════════════════════════════════════════════════════
🔀  PULL REQUESTS
═══════════════════════════════════════════════════════════════════════════════════

CREATING A PR:
  - Base and compare branch selectors (with search)
  - Across forks (head repo selector + branch)
  - Title auto-populated from last commit message
  - TipTap rich markdown editor with:
    - Bold, italic, code, links, tables, task lists
    - Drag-and-drop image upload
    - @mention autocomplete (users, teams)
    - #reference autocomplete (issues, PRs)
    - /slash commands (e.g. /label bug, /assign @user)
  - PR templates (auto-loaded from .veteran/PULL_REQUEST_TEMPLATE.md or multiple)
  - Draft PR toggle
  - Reviewers selector (users + teams)
  - Assignees selector
  - Labels selector (with create-on-the-fly)
  - Milestone selector
  - Projects selector (link to kanban card)
  - Linked issues (will close on merge)
  - Live preview of diff before submitting

PR DETAIL PAGE:
  Timeline:
  - Full chronological timeline mixing: commits, comments, reviews,
    events (assigned, labeled, merged, closed, locked), status checks,
    deploy events, referenced issues
  - Each commit in PR shows CI status icon
  - Pinned status at top: CI status, review status, merge conflicts, branch up-to-date
  
  Status bar (sticky, shows PR merge readiness):
  ✓ 2 approving reviews
  ✓ All required status checks passed
  ✗ 1 merge conflict — needs resolution
  ✓ Branch is up to date
  → [Merge pull request ▼] button (disabled until all checks pass, if configured)
  
  Merge options:
  - Create merge commit: full history preserved
  - Squash and merge: all commits squashed into one
  - Rebase and merge: commits replayed on top of base
  - Auto-merge: enable auto-merge when all checks pass
  - Delete branch after merge (checkbox)
  - Edit merge commit message before merging
  
  After merge:
  - "Revert" button to create a revert PR
  - Branch deleted indicator + restore button
  - Linked issues auto-closed with crosslink

PR DIFF VIEW (Files Changed tab):
  - Summary: N files changed, X additions, Y deletions, Z commits
  - Filter files by: all, viewed, unviewed
  - Search files in diff
  - File-by-file accordion (expand/collapse)
  - Mark file as "viewed" (checkbox per file)
  - Per-file diff options: unified / split mode
  - Syntax highlighted diff (+/- lines)
  - Expand context lines (10 more above/below)
  - Expand entire file
  - Inline comments:
    - Click line number to open comment box
    - Drag across lines to comment on range
    - Suggest changes (inline code suggestion the author can commit)
    - React to comments (emoji)
    - Resolve thread
    - Re-open thread
    - Edit/delete own comments
  - Right-click any line: copy line, copy permalink, open in editor (Codespace)
  - Image diffs (side-by-side slider, swipe mode, onion skin mode, difference mode)

CODE REVIEW SYSTEM:
  - Start review (queue multiple comments before submitting)
  - Submit review with:
    - Comment only (no approval/rejection)
    - Approve (adds to approval count)
    - Request changes (blocks merge)
  - Required reviews count display
  - Review dismissal (maintainer can dismiss stale reviews with reason)
  - Re-request review (after addressing feedback)
  - Suggested changes batch commit (commit all accepted suggestions at once)
  - Code owners (.veteran/CODEOWNERS file support)
    - Auto-assign code owners as reviewers
    - Required code owner review option in branch protection

PR CHECKS:
  - Status checks displayed inline per commit and in PR summary
  - Expandable check details (log output)
  - Required checks block merge
  - Check suites (group related checks)
  - Re-run failed checks button

═══════════════════════════════════════════════════════════════════════════════════
🐛  ISSUES
═══════════════════════════════════════════════════════════════════════════════════

ISSUE CREATION:
  - Issue templates (blank + templates from .veteran/ISSUE_TEMPLATE/)
  - Template chooser page with descriptions
  - Contact links (link to external support, forum, etc.)
  - Title + TipTap rich markdown body
  - Labels (multiple, create-on-the-fly)
  - Assignees (multiple)
  - Milestone
  - Project board card
  - Type: Bug, Feature, Documentation, Question, Security (customizable)

ISSUE LIST:
  - Default filter: is:open
  - Toggle open/closed
  - Filter by: label, milestone, assignee, author, type, project
  - Sort by: newest, oldest, most commented, least commented,
    most reactions, least reactions, recently updated, least recently updated
  - Search (full text, supports GitHub-style syntax: label:bug author:arjav)
  - Bulk actions: close, open, label, assign, add to milestone, add to project
  - Label manager (create/edit/delete labels, color picker, description)
  - Milestone manager (create/edit/delete, due date, progress bar)
  - Saved filters (pin custom filter combinations)

ISSUE DETAIL:
  - Full timeline (comments + events interleaved)
  - Sticky sidebar: labels, assignees, milestone, projects, linked PRs
  - Lock/unlock issue (disable comments)
  - Pin/unpin issue (up to 3 pinned per repo)
  - Transfer to another repo (owned by same user/org)
  - Convert to discussion
  - Close with comment
  - Close as: completed / not planned (different icon)
  - Reference other issues/PRs (auto-creates crosslink)
  - Emoji reactions (👍👎😄🎉😕❤️🚀👀) on issue body and comments
  - Subscribe/unsubscribe to notifications
  - Edit issue title (click to edit inline)
  - Edit issue body (with revision history)
  - Comment:
    - TipTap editor
    - Preview tab
    - Drag-and-drop image/file upload
    - @mentions
    - #references
    - /slash commands
    - Markdown shortcuts (Cmd+B, Cmd+I, etc.)
    - Save draft in localStorage
  - Edit/delete own comments (with edit history viewable)
  - Quote reply (highlight text → "Reply" button)
  - Minimize comment (mark as spam, outdated, resolved, off-topic)
  - Report comment

LABELS SYSTEM:
  - Default labels: bug, documentation, duplicate, enhancement,
    good first issue, help wanted, invalid, question, wont fix
  - Full color picker (hex input + presets + recent)
  - Label descriptions
  - Bulk label import from another repo
  - Label groups (organize labels into categories)
  - Exclusive labels (only one from group can be applied)

MILESTONES:
  - Title, description, due date
  - Progress bar (open vs closed issues percentage)
  - Sort by: due date, completeness, title
  - Filter issues/PRs by milestone
  - Close milestone (with option to move open issues to new milestone)

═══════════════════════════════════════════════════════════════════════════════════
💬  DISCUSSIONS
═══════════════════════════════════════════════════════════════════════════════════

  - Repository-level discussions (separate from issues)
  - Categories: Announcements (maintainer-only), General, Ideas,
    Q&A (answer marking), Show and Tell, Polls
  - Create/edit/delete discussions
  - Pin discussions (up to 4)
  - Lock/unlock
  - Convert to issue
  - Transfer between repos
  - Comments with nested replies (2 levels)
  - Mark answer (for Q&A — goes to top)
  - Upvote discussions and comments
  - Emoji reactions
  - Subscribe to discussion
  - Search discussions
  - Org-wide discussions (cross-repo)
  - Discussion templates
  - RSS feed

═══════════════════════════════════════════════════════════════════════════════════
⚡  VETERAN ACTIONS (CI/CD)
═══════════════════════════════════════════════════════════════════════════════════

This is the equivalent of GitHub Actions — a full CI/CD pipeline runner.

WORKFLOW FILES:
  - Location: .veteran/workflows/*.yml
  - YAML syntax compatible with GitHub Actions (migrate easily)
  - Workflow triggers:
    push, pull_request, pull_request_target, schedule (cron),
    workflow_dispatch (manual), workflow_call (reusable),
    release, issues, issue_comment, pull_request_review,
    repository_dispatch (API triggered), create, delete,
    deployment, discussion, fork, gollum (wiki), label,
    milestone, page_build, public, registry_package,
    star, status, watch
  - Supports: jobs, steps, needs (job dependencies), matrix strategy,
    env variables, secrets, outputs, artifacts, cache,
    concurrency groups, timeout-minutes, continue-on-error
  - Supports composite actions (reusable steps)
  - Supports custom actions (JavaScript, Docker, composite)

JOB RUNNER:
  - Built-in runner (lightweight, runs jobs in Docker containers)
  - Runner labels (ubuntu-latest, node-20, python-3.12, etc.)
  - Job isolation (each job gets fresh container)
  - Parallel job execution
  - Job output passing between jobs
  - Matrix builds (test across multiple OS/versions)
  - Caching (restore/save cache by key and path)
  - Artifacts upload/download
  - Self-hosted runner support (register external runners via token)
  - Runner groups (org-level)
  - Windows/macOS runner stubs (for self-hosted)
  - Resource limits per job (CPU, memory, timeout)

ACTIONS MARKETPLACE:
  - Browse/search community actions
  - Action detail page (README, versions, inputs/outputs)
  - Verified actions badge
  - Install action into workflow (copy-paste snippet)
  - Popular built-in actions included:
    veteran/checkout@v4
    veteran/setup-node@v4
    veteran/setup-python@v5
    veteran/cache@v4
    veteran/upload-artifact@v4
    veteran/download-artifact@v4
    veteran/create-release@v1
    veteran/deploy-pages@v4

WORKFLOW UI:
  - Actions tab shows all workflow runs
  - Filter by: workflow, branch, event, status, actor
  - Run detail: job graph (DAG visualization), status per job
  - Job detail: step-by-step log output (ANSI color support)
  - Live log streaming (tail -f style via SSE)
  - Log search
  - Log download
  - Re-run all jobs / re-run failed jobs
  - Cancel running workflow
  - Workflow dispatch form (manual trigger with inputs)
  - Cron schedule visualizer
  - Usage minutes dashboard (per repo and org)
  - Concurrent run limits display

DEPLOYMENTS:
  - Deployment history per environment
  - Active deployment indicator on repo header
  - Deployment status: pending, in_progress, success, failure, inactive
  - Deployment logs link
  - Rollback to previous deployment
  - Required reviewers for environment deployments

═══════════════════════════════════════════════════════════════════════════════════
💻  VETERAN CODESPACES
═══════════════════════════════════════════════════════════════════════════════════

This is the equivalent of GitHub Codespaces — cloud development environments.

CODESPACE CREATION:
  - "Open in Codespace" button on any repo/branch/PR/commit
  - Machine type selector (2-core, 4-core, 8-core, 16-core, 32-core)
  - Region selector (US East, US West, EU West, Asia Pacific)
  - devcontainer.json support (auto-detected from repo)
  - Dotfiles repo support (auto-applies user's dotfiles)
  - Pre-build support (faster startup via cached environment)
  - VS Code in browser (full Monaco-based VS Code — not openvscode-server, 
    a custom-built equivalent with all extensions support)
  - Port forwarding (auto-detect listening ports, make public or private)
  - Terminal access (full bash/zsh/fish terminal)
  - Extensions support (VS Code marketplace compatible)
  - Themes (VS Code compatible)
  - Settings sync (from user's VS Code settings)
  - Live Share (real-time collaborative coding in same Codespace)

CODESPACE MANAGEMENT:
  - List all codespaces (repo, branch, machine, last used, status)
  - Start / Stop / Delete codespace
  - Rename codespace
  - Change machine type (requires restart)
  - Export to branch (commit uncommitted changes to new branch)
  - Codespace secrets (encrypted env vars injected at creation)
  - Retention policy (auto-delete after N days of inactivity)
  - Usage tracking (hours used, storage used)
  - Billing dashboard (per user, per org)

DEVCONTAINER SUPPORT:
  Full devcontainer.json spec implementation:
  - image (Docker image to use as base)
  - build (Dockerfile path + build args)
  - features (devcontainer features from registry)
  - postCreateCommand (run after container creation)
  - postStartCommand (run after container starts)
  - forwardPorts (auto-forward ports)
  - portsAttributes (port labels, protocol, visibility)
  - remoteEnv (environment variables)
  - mounts (additional volume mounts)
  - extensions (VS Code extensions to install)
  - settings (VS Code settings to apply)
  - hostRequirements (specify min machine specs)

CODESPACE ORCHESTRATION (backend):
  - Docker-in-Docker or Kubernetes pod per codespace
  - Network isolation per codespace
  - Persistent volume per codespace (survives stops)
  - Port proxy with authentication (public ports get token-auth URL)
  - Heartbeat system (detect idle codespaces for auto-stop)
  - Backup/restore codespace state
  - SSH access to codespace (veteran ssh codespace-name)

═══════════════════════════════════════════════════════════════════════════════════
📦  VETERAN PACKAGES
═══════════════════════════════════════════════════════════════════════════════════

Multi-format package registry per repo/org:

NPM REGISTRY:
  - Compatible with npm/yarn/pnpm
  - Publish: npm publish --registry https://veteran.instance/npm/
  - Scoped packages (@org/package)
  - Version history with yanked versions
  - Deprecation notices
  - Download counts per version
  - Dependencies visualization
  - Security advisories per package
  - README rendering
  - dist-tags (latest, next, beta)

DOCKER REGISTRY:
  - OCI-compliant container registry
  - docker pull veteran.instance/owner/repo/image:tag
  - Multi-platform manifests (amd64, arm64)
  - Layer deduplication
  - Image size display
  - Vulnerability scanning (Trivy integration)
  - Image signing (cosign compatible)
  - Retention policies (keep last N versions)
  - Pull statistics

ADDITIONAL FORMATS (stubs ready for activation):
  - RubyGems (gem registry)
  - PyPI (pip registry)
  - Maven (Java packages)
  - NuGet (.NET packages)
  - Cargo (Rust crates)
  - Helm (Kubernetes charts)
  - Generic (arbitrary file hosting with versioning)

PACKAGE UI:
  - Packages tab on repo and user/org profile
  - Installation instructions per package type (code snippet)
  - Download statistics graph
  - Linked repositories
  - Version selector
  - Vulnerability badge
  - License display

═══════════════════════════════════════════════════════════════════════════════════
🗺️  PROJECTS (KANBAN/TABLE/ROADMAP)
═══════════════════════════════════════════════════════════════════════════════════

  - Create project per repo or org-level
  - Views: Board (Kanban), Table, Roadmap (Gantt-style timeline)
  
  BOARD VIEW:
  - Drag-and-drop columns
  - Drag-and-drop cards within and between columns
  - Default columns: No Status, Todo, In Progress, Done
  - Add/rename/delete/reorder columns
  - Column WIP limits
  - Card: linked issue/PR or standalone note
  - Card preview (title, labels, assignees, PR status, issue state)
  - Archive column (done items auto-archive after N days)
  - Automation rules:
    "When issue opened → move to Todo"
    "When PR merged → move to Done"
    "When issue closed → move to Done"
  
  TABLE VIEW:
  - Spreadsheet-like view of all project items
  - Custom fields: Text, Number, Date, Single select, Multi-select,
    Iteration (sprint), Linked PR, Reviewer
  - Sort by any field
  - Group by any field
  - Filter by any field
  - Inline editing of all fields
  - Bulk edit (select multiple, edit field for all)
  - Column resize/reorder/hide
  
  ROADMAP VIEW:
  - Timeline visualization (weeks, months, quarters)
  - Drag to set start/end dates on items
  - Milestones displayed on timeline
  - Dependencies between items (arrows)
  - Zoom in/out on timeline
  - Today indicator line
  - Group items by label, assignee, or custom field

═══════════════════════════════════════════════════════════════════════════════════
📖  WIKI
═══════════════════════════════════════════════════════════════════════════════════

  - Each repo has a Wiki backed by a separate git repo (repo.wiki.git)
  - Clone wiki locally: git clone veteran.instance/owner/repo.wiki.git
  - Create/edit/delete wiki pages (Monaco editor)
  - Markdown rendering with full GFM support
  - Sidebar: auto-generated from _Sidebar.md or alphabetical page list
  - Footer: from _Footer.md
  - Page history (full git commit history)
  - Page diff view (compare revisions)
  - Search within wiki (full-text)
  - Table of contents (auto-generated from headings)
  - Custom page ordering via _Sidebar.md
  - Image upload to wiki
  - Internal wiki links ([[Page Name]])
  - Access control: public or collaborator-only editing

═══════════════════════════════════════════════════════════════════════════════════
🔒  SECURITY
═══════════════════════════════════════════════════════════════════════════════════

VULNERABILITY MANAGEMENT:
  - Dependency graph (parse package.json, requirements.txt, 
    Gemfile, Cargo.toml, pom.xml, build.gradle, etc.)
  - Dependabot-equivalent alerts:
    - Nightly scan against OSV.dev vulnerability database
    - Create alert per vulnerable dependency
    - Dismiss alert with reason
    - Auto-create PRs for dependency updates
  - Secret scanning:
    - Scan all commits/pushes for secrets (AWS keys, API tokens, etc.)
    - 100+ secret patterns (GitHub token format, Stripe keys, etc.)
    - Block push if secret detected (configurable)
    - Alert repository owner
    - Valid secret notification to service providers
  - Code scanning:
    - SARIF format result ingestion (from Actions CodeQL step)
    - Display inline on code files and PRs
    - Severity levels: critical, high, medium, low, note, error
    - Filter and manage alerts
    - Auto-dismiss fixed alerts
  - Security policy (SECURITY.md renderer)
  - Private vulnerability reporting:
    - Users can report vulns privately (not public issue)
    - Maintainers receive private notification
    - Collaborative fix workflow (private fork)
    - CVE request integration stub
  - Security advisories:
    - Create/publish security advisories (CVE format)
    - CVSS score calculator
    - Affected packages/versions
    - Patched versions
    - CWE reference

═══════════════════════════════════════════════════════════════════════════════════
📊  INSIGHTS
═══════════════════════════════════════════════════════════════════════════════════

  Pulse (/:owner/:repo/pulse):
  - Active PRs (merged and proposed) in period
  - Active issues (closed and new) in period
  - Commits count and authors
  - Unresolved conversations
  - Period selector: 24h, 3 days, 1 week, 1 month

  Contributors:
  - Ranked list of contributors by commits
  - Per-contributor: commits, additions, deletions
  - Bar chart over time (who committed when)
  - Period filter

  Traffic:
  - Unique visitors and page views (14 days)
  - Clones (total and unique)
  - Referring sites (top traffic sources)
  - Popular content (most-visited files/pages)
  - Star history graph
  - Fork history graph
  - Watch history graph

  Commits:
  - Commit frequency graph (bar chart per week, 52 weeks)
  - Time of day heatmap (punch card — by day of week + hour)

  Code Frequency:
  - Additions vs deletions per week graph

  Dependency Graph:
  - Visual dependency tree
  - License per dependency
  - Vulnerability count per dependency
  - Dependents (who depends on this repo — if public)

  Network Graph:
  - D3-based fork network visualization
  - Timeline of all forks and their branches
  - Compare any two points in the network

  Language Breakdown:
  - Donut chart by bytes
  - Click language to filter files

  Issue/PR velocity charts

═══════════════════════════════════════════════════════════════════════════════════
🏢  ORGANIZATIONS
═══════════════════════════════════════════════════════════════════════════════════

  - Create org with username, display name, avatar, bio, website, email
  - Org profile page:
    - Public/private member list toggle
    - Pinned repos (up to 6)
    - Org README (special repo .org-readme renders on profile)
    - Verified domain badge
    - All public repos list
    - People tab (public member list)
  
  MEMBERSHIP:
  - Owner, Member, Outside Collaborator roles
  - Invite by email or username
  - Invitation expiry (7 days)
  - Remove member (with repo access revocation)
  - Leave organization
  - Reinstate former member (restore previous repo access)
  - Base permissions: No permissions, Read, Write, Admin
  - Member visibility: Public or Private
  
  TEAMS:
  - Create teams with name, description, avatar
  - Team visibility: Visible (org-wide) or Secret
  - Parent team support (team hierarchy)
  - Add/remove members
  - Sync team membership from identity provider (LDAP/SAML)
  - Give team access to repos with permission level
  - Team discussions (separate from repo discussions)
  - Team @mention (notifies all members)
  - Team review requests (request review from whole team)
  
  ORG SETTINGS:
  - Billing email and contact info
  - Member base permissions
  - Repository creation permissions (all members or owners only)
  - Fork permissions
  - Repository visibility change permissions
  - Team creation permissions
  - Two-factor requirement enforcement for all members
  - SAML SSO configuration
  - IP allowlist
  - OAuth app access policy
  - Third-party app access policy
  - Audit log (see all org events)
  - Webhooks (org-level)
  - Action permissions (allow all, local only, specific)
  - Runner groups
  - Billing/usage dashboard

═══════════════════════════════════════════════════════════════════════════════════
🌐  GIT PROTOCOL
═══════════════════════════════════════════════════════════════════════════════════

SMART HTTP (RFC-compliant):
  GET  /:user/:repo.git/info/refs?service=git-upload-pack
  POST /:user/:repo.git/git-upload-pack
  GET  /:user/:repo.git/info/refs?service=git-receive-pack
  POST /:user/:repo.git/git-receive-pack
  GET  /:user/:repo.git/objects/info/packs
  GET  /:user/:repo.git/objects/:pack-hash.idx
  GET  /:user/:repo.git/objects/:pack-hash.pack
  GET  /:user/:repo.git/objects/:ab/:cdef...(loose objects)
  - Basic Auth (username + password OR PAT)
  - Per-operation permission check
  - Pack size limits per user/plan
  - Bandwidth tracking
  - Shallow clone support (--depth)
  - Partial clone support (--filter)
  - Sparse checkout support
  - Bundle protocol support
  - Git protocol v2 support (faster, smarter negotiation)
  - Ref advertisement filtering (hide internal refs)
  - Pre-receive hook enforcement (branch protection)
  - Post-receive hook (trigger webhooks, CI, notifications)
  - Update hook (per-ref permission check)

SSH PROTOCOL:
  - Custom SSH server on port 2222 (configurable)
  - Ed25519 host key (auto-generated on first run)
  - Public key authentication (from user's registered SSH keys)
  - Username: git (all users use git@ with key-based identity)
  - git clone git@veteran.instance:user/repo.git
  - Same permission model as HTTP
  - SSH certificate authority support
  - Force-command (SSH restricted to git operations only)
  - Connection logging
  - Max connections per user

LFS (Git Large File Storage):
  - Full LFS API implementation:
    POST /:user/:repo.git/info/lfs/objects/batch
    GET  /:user/:repo.git/info/lfs/objects/:oid
    PUT  /:user/:repo.git/info/lfs/objects/:oid
    POST /:user/:repo.git/info/lfs/verify
    POST /:user/:repo.git/info/lfs/locks
    DELETE /:user/:repo.git/info/lfs/locks/:id
    GET  /:user/:repo.git/info/lfs/locks
  - LFS objects stored in /data/lfs/:oid[:2]/:oid[:2][:2]/:oid
  - LFS storage quota per user/org
  - LFS bandwidth quota per month
  - LFS object deduplication (content-addressed)
  - File locking support (exclusive lock for binary files)

HOOKS SYSTEM:
  - Pre-receive: runs before ref update is accepted
    (enforce branch protection, check commit signatures, scan secrets)
  - Update: runs per-ref during receive
  - Post-receive: runs after successful push
    (trigger webhooks, CI, send notifications, update search index)
  - Pre-push: client-side hook injection via clone
  - Custom server-side hooks per repo (admin-managed)
  - Hook timeout configuration
  - Hook failure handling (pre-receive failure rejects push)

═══════════════════════════════════════════════════════════════════════════════════
🪝  WEBHOOKS & INTEGRATIONS
═══════════════════════════════════════════════════════════════════════════════════

WEBHOOKS:
  - Repo and Org level webhooks
  - Configure: URL, secret, content type (json/form), SSL verify
  - Event selection:
    push, pull_request, pull_request_review, pull_request_review_comment,
    issues, issue_comment, create, delete, release, deployment, 
    deployment_status, fork, gollum, label, member, membership,
    milestone, organization, page_build, ping, project, project_card,
    project_column, public, pull_request_review_thread, registry_package,
    repository, repository_dispatch, security_advisory, star, status,
    team, team_add, watch, workflow_dispatch, workflow_job, workflow_run,
    check_run, check_suite, commit_comment, discussion, discussion_comment,
    meta, package, repository_import, repository_ruleset
  - GitHub-compatible payload format (drop-in replacement)
  - Webhook secret validation (HMAC-SHA256 signature header)
  - Delivery log: last 100 deliveries with request/response bodies
  - Delivery re-send button
  - Delivery filter by event type and status
  - Retry logic (3 retries with exponential backoff)
  - Timeout: 10 seconds
  - Failure alert after consecutive failures
  - Webhook ping (send test payload)

OAUTH APPS:
  - Register OAuth application (name, homepage, callback URL, logo)
  - Client ID + Client Secret management
  - Authorization flow: /veteran/oauth/authorize
  - Token exchange: /veteran/oauth/access_token
  - Revoke tokens
  - View authorized apps (user settings)
  - Revoke app access (user settings)
  - App statistics (installs, tokens)

VETERAN APPS (Marketplace):
  - App registration (name, description, logo, homepage, permissions)
  - Installation: repo-level or org-level
  - Fine-grained permissions (contents:read, issues:write, etc.)
  - Installation access tokens (short-lived, scoped to installation)
  - Webhook events per installation
  - App bot account (comments, reviews show "[bot]" badge)
  - Marketplace listing page
  - Install/uninstall flow
  - App suspension by org owner

═══════════════════════════════════════════════════════════════════════════════════
🔔  NOTIFICATIONS
═══════════════════════════════════════════════════════════════════════════════════

  - Real-time notification bell in header (Socket.io)
  - Unread count badge (red dot with count)
  - Notification inbox (/notifications):
    - Grouped by repository
    - Filter: all, unread, participating, done
    - Filter by reason: mention, review_requested, assign, 
      author, comment, subscribed, team_mention, manual
    - Mark as read (individual, per-repo, all)
    - Mark as done (removes from inbox)
    - Save (bookmark important notifications)
    - Open in new tab (Cmd+click)
    - Custom notification sounds (browser notifications API)
  - Notification reasons:
    - Assigned (to you)
    - Mentioned (@you)
    - Review requested
    - Subscribed (watching repo/issue)
    - Participating (commented/committed)
    - Team mentioned
    - Security alert
    - CI failure (on your branch)
  - Watch repository:
    - Not watching (only @mentions + assigned)
    - Participating and @mentions
    - All Activity
    - Custom (choose specific events)
    - Ignore
  - Per-repository notification overrides
  - Email notifications:
    - Digest mode (immediate / 8h / 24h)
    - Plain text or HTML email
    - Email footer unsubscribe link
    - Reply-to-comment via email
  - Mobile push notifications (PWA)
  - Slack integration (post notifications to channel)

═══════════════════════════════════════════════════════════════════════════════════
🔍  SEARCH
═══════════════════════════════════════════════════════════════════════════════════

  Global search (Cmd+K or /):
  - Instant results as you type (debounced 200ms)
  - Result categories: Repos, Code, Commits, Issues, PRs, 
    Users, Discussions, Wikis, Packages
  - Recent searches (localStorage + server-side for logged in)
  - Search history (user's recent queries)
  
  Full search syntax:
  Repositories: stars:>100 language:typescript pushed:>2024-01-01
  Code:         extension:py function:authenticate path:src/auth
  Commits:      author:arjav merge:false author-date:2024-01-01..2024-12-31
  Issues/PRs:   is:open is:pr review:required assignee:arjav label:bug
  Users:        type:user followers:>100 location:India
  
  Code search features:
  - Full-text search using PostgreSQL FTS (tsvector/tsquery)
  - File path filtering
  - Extension filtering
  - Language filtering  
  - Repository filtering
  - Symbol search (functions, classes, methods)
  - Regex search option
  - Case sensitivity toggle
  - Results with line context (3 lines around match)
  - Direct file open with line highlight
  
  AI-powered search (optional, Supabase pgvector):
  - Semantic code search (describe what you're looking for)
  - Natural language issue search
  - Similar issue detection (prevent duplicates)
  - Smart autocomplete suggestions
  
  Explore page:
  - Trending repos (today, this week, this month)
  - Filter trending by language
  - Topics directory (browse repos by topic)
  - Collections (curated lists of repos)
  - Events (upcoming developer events)
  - Featured projects

═══════════════════════════════════════════════════════════════════════════════════
🛡️  ADMIN PANEL (/admin)
═══════════════════════════════════════════════════════════════════════════════════

  Dashboard:
  - Key metrics: total users, repos, orgs, issues, PRs, packages
  - New signups graph (last 30 days)
  - Git operations graph (pushes, clones per day)
  - Storage usage gauge (total and per-user top 10)
  - Active codespaces count
  - Background job queue health
  - System health: CPU, memory, disk, Redis status
  
  User Management:
  - Search/filter users (username, email, created date, role)
  - View user details (all their repos, orgs, login history)
  - Promote to admin / demote
  - Suspend user (disable login, repos go read-only)
  - Unsuspend user
  - Force password reset
  - Delete user (with data handling options: delete repos or transfer)
  - Impersonate user (admin acts as that user for debugging)
  - Send email to user
  - View user's audit log
  - Export users CSV
  
  Repository Management:
  - Search all repos
  - Force delete repo
  - Change repo visibility
  - Transfer repo ownership
  - View repo settings (any repo)
  - Disk usage per repo
  
  Organization Management:
  - List all orgs
  - View org details
  - Add/remove org owners
  - Delete org
  
  Site Settings:
  - Site name, description, logo, favicon
  - Homepage mode (landing page or login redirect)
  - Registration: open, invite-only, disabled
  - Email verification requirement
  - Default site theme
  - Custom CSS injection
  - Custom footer links
  - Robot.txt configuration
  - Announcement banner (dismissible, site-wide, markdown supported)
  - Maintenance mode (with custom message)
  
  Authentication Settings:
  - Enable/disable OAuth providers with credential input
  - Force 2FA for all users
  - Session timeout duration
  - Password policy (min length, complexity, history)
  - IP rate limiting thresholds
  - Blocked email domains
  - Allowed email domains (whitelist mode)
  
  Email/SMTP:
  - SMTP server configuration
  - Test email send
  - Email template customization (logo, colors, footer)
  - Email queue status
  
  Storage:
  - Total disk usage breakdown (repos, LFS, uploads, logs)
  - Per-user storage quotas
  - LFS storage quota management
  - Cleanup tools (delete orphaned objects, compress old repos)
  - Backup: trigger full backup (tar.gz of /data), download link
  - Restore from backup
  
  Actions/CI:
  - Registered runners list (online/offline status)
  - Assign runners to runner groups
  - Usage minutes per repo/org
  - Queue depth and processing rate
  - Clear stuck jobs
  
  Codespaces:
  - Active codespaces list (user, repo, machine, since)
  - Force stop codespace
  - Codespace quota per user
  - Machine type availability configuration
  
  Packages:
  - Package registry storage per repo/org
  - Delete package versions
  - Storage quota configuration
  
  Audit Log:
  - Full searchable audit log (all admin actions + auth events)
  - Filter by: user, action, resource type, date range
  - Export to CSV/JSON
  
  Monitoring:
  - Real-time log viewer (tail system logs)
  - Error rate graph
  - Latency percentile graphs (p50, p95, p99)
  - Background job success rate
  - Redis memory usage
  - Git operation metrics
  - Application version + uptime display
  
  Security:
  - Failed login attempts (by IP, by username)
  - Block IP address
  - Unblock IP address
  - Blocked IPs list
  - Active sessions count
  - Force logout all users
  - SSH host key display (fingerprint + public key)

═══════════════════════════════════════════════════════════════════════════════════
📡  COMPLETE REST API (/api/v1)
═══════════════════════════════════════════════════════════════════════════════════

  GitHub API v3 compatible (clients built for GitHub work with Veteran).
  
  Every endpoint:
  - OpenAPI 3.1 spec (auto-generated, browseable at /api/docs)
  - Consistent response envelope: { data, error, meta }
  - Cursor-based pagination with Link headers + X-Total-Count
  - Rate limiting headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - Conditional requests: ETag + If-None-Match, If-Modified-Since
  - CORS headers for browser clients
  
  Endpoint groups (all fully implemented):
  
  /meta          — rate limits, Zen quote, API version, server info
  /auth          — register, login, logout, refresh, 2FA, OAuth
  /user          — authenticated user profile, settings, keys, tokens
  /users/:login  — public profiles, followers, repos, starred, gists
  /repos         — full CRUD, contents, commits, branches, tags, releases,
                   deployments, statuses, check-runs, check-suites,
                   code-scanning, secret-scanning, dependency-graph,
                   collaborators, hooks, keys, topics, traffic,
                   community profile, pages, actions secrets/variables,
                   environments, rulesets
  /repos/forks   — fork management, fork sync
  /issues        — full CRUD, comments, events, labels, milestones, 
                   assignees, reactions, timeline, transfers
  /pulls         — full CRUD, reviews, review-comments, review-requests,
                   requested-reviewers, files, commits, merge, revert
  /actions       — workflows, runs, jobs, artifacts, cache, secrets,
                   variables, runners, runner-groups
  /codespaces    — full CRUD, export, ports, secrets
  /packages      — list, versions, delete
  /orgs          — full CRUD, members, teams, repos, webhooks, 
                   audit-log, actions, codespaces, packages
  /teams         — full CRUD, members, repos, discussions, comments
  /projects      — full CRUD, columns, cards, automation
  /discussions   — full CRUD, comments, votes, categories
  /notifications — list, mark-read, subscriptions, threads
  /search        — repositories, code, commits, issues, users, labels, topics
  /gists         — full CRUD, forks, stars, comments (bonus feature)
  /markdown      — render markdown to HTML
  /gitignore     — list templates, get template
  /licenses      — list, get by key
  /emojis        — list all supported emoji
  /events        — public event stream, user events, repo events
  /admin         — (superadmin only) site management
  /installation  — app installation management
  /apps          — OAuth apps, Veteran apps

═══════════════════════════════════════════════════════════════════════════════════
📱  PAGES & ROUTES
═══════════════════════════════════════════════════════════════════════════════════

  Public:
  /                            Landing page (if not logged in) or feed
  /login                       Sign in
  /signup                      Create account
  /forgot-password             Password reset request
  /reset-password/:token       Password reset form
  /verify-email/:token         Email verification
  /explore                     Trending repos, topics, developers
  /explore/topics/:topic       Browse by topic
  /:user                       User/org profile
  /:user/:repo                 Repository code view
  /:user/:repo/tree/:branch    Browse at branch
  /:user/:repo/tree/:branch/*  Browse specific path
  /:user/:repo/blob/:branch/*  View file
  /:user/:repo/raw/:branch/*   Raw file
  /:user/:repo/edit/:branch/*  Edit file in browser
  /:user/:repo/commits         Commit history
  /:user/:repo/commits/:branch Commit history for branch
  /:user/:repo/commit/:sha     Commit detail
  /:user/:repo/branches        Branch list
  /:user/:repo/tags            Tags list
  /:user/:repo/releases        Releases list
  /:user/:repo/releases/tag/:tag Release detail
  /:user/:repo/releases/new    Create release
  /:user/:repo/issues          Issues list
  /:user/:repo/issues/new      Create issue
  /:user/:repo/issues/:number  Issue detail
  /:user/:repo/pulls           PRs list
  /:user/:repo/pulls/new       Create PR
  /:user/:repo/pull/:number    PR detail
  /:user/:repo/pull/:number/files PR files changed
  /:user/:repo/pull/:number/commits PR commits
  /:user/:repo/actions         Actions workflow list
  /:user/:repo/actions/workflows/:name Workflow detail
  /:user/:repo/actions/runs/:id Run detail
  /:user/:repo/actions/runs/:id/jobs/:jobId Job log
  /:user/:repo/projects        Projects list
  /:user/:repo/projects/:id    Project detail
  /:user/:repo/wiki            Wiki home
  /:user/:repo/wiki/:page      Wiki page
  /:user/:repo/discussions     Discussions list
  /:user/:repo/discussions/:number Discussion detail
  /:user/:repo/security        Security overview
  /:user/:repo/security/advisories Security advisories
  /:user/:repo/insights        Insights overview
  /:user/:repo/insights/pulse  Pulse
  /:user/:repo/insights/contributors Contributors
  /:user/:repo/insights/traffic Traffic
  /:user/:repo/insights/commits Commit activity
  /:user/:repo/insights/code-frequency Code frequency
  /:user/:repo/insights/network Fork network
  /:user/:repo/packages        Packages
  /:user/:repo/settings        Repo settings (tabs: General, Access, 
                               Branches, Webhooks, Integrations, 
                               Deploy Keys, Secrets, Environments,
                               Pages, Security, Advanced)
  /:user/:repo/compare         Branch comparison / PR creation
  /:user/:repo/compare/:base...:compare Full comparison
  
  Authenticated:
  /                            Dashboard (activity feed, news)
  /new                         Create repo
  /organizations/new           Create org
  /import                      Import repo from URL
  /settings                    User settings (tabs: Profile, Account,
                               Appearance, Accessibility, Notifications,
                               Billing, Emails, Password, Sessions, 
                               SSH Keys, GPG Keys, Tokens, Applications,
                               Developer Settings, Codespaces, Security)
  /settings/codespaces         Codespace settings + dotfiles repo
  /codespaces                  My codespaces list
  /notifications               Notification inbox
  /issues                      All issues assigned to me / created by me
  /pulls                       All PRs assigned to me / created by me
  /organizations/:org/settings Org settings
  
  Admin:
  /admin                       Admin dashboard
  /admin/users                 User management
  /admin/repos                 Repo management
  /admin/orgs                  Org management
  /admin/settings              Site settings
  /admin/email                 Email settings
  /admin/storage               Storage management
  /admin/actions               Actions & runners
  /admin/codespaces            Codespace management
  /admin/packages              Package registry
  /admin/audit-log             Audit log
  /admin/monitoring            System monitoring
  /admin/security              Security settings

═══════════════════════════════════════════════════════════════════════════════════
📁  COMPLETE FILE STRUCTURE
═══════════════════════════════════════════════════════════════════════════════════

veteran/
├── Dockerfile                        (multi-stage)
├── docker-compose.yml                (full stack)
├── docker-compose.dev.yml            (dev overrides + hot reload)
├── .env.example                      (100+ documented variables)
├── nginx.conf                        (reverse proxy config)
├── supervisord.conf                  (process management)
├── .gitignore
├── README.md                         (setup guide)
│
├── packages/
│   └── shared/                       (shared TypeScript types + Zod schemas)
│       ├── src/
│       │   ├── types/                (all entity types)
│       │   └── schemas/              (Zod validation schemas)
│       └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.ts                 (Express app entry)
│   │   ├── app.ts                    (Express setup + middleware)
│   │   ├── config/
│   │   │   ├── env.ts                (type-safe env parsing with Zod)
│   │   │   ├── database.ts           (Prisma + Supabase client)
│   │   │   ├── redis.ts              (Redis client)
│   │   │   └── constants.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               (JWT verification + Supabase auth)
│   │   │   ├── rateLimit.ts          (per-route rate limiting)
│   │   │   ├── requestLogger.ts      (structured request logging)
│   │   │   ├── errorHandler.ts       (global error handling)
│   │   │   ├── cors.ts
│   │   │   └── pagination.ts         (cursor pagination helper)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── repos.routes.ts
│   │   │   ├── git.routes.ts         (Smart HTTP endpoints)
│   │   │   ├── issues.routes.ts
│   │   │   ├── pulls.routes.ts
│   │   │   ├── actions.routes.ts
│   │   │   ├── codespaces.routes.ts
│   │   │   ├── packages.routes.ts
│   │   │   ├── orgs.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   ├── projects.routes.ts
│   │   │   ├── discussions.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── search.routes.ts
│   │   │   ├── webhooks.routes.ts
│   │   │   ├── lfs.routes.ts
│   │   │   ├── wiki.routes.ts
│   │   │   ├── security.routes.ts
│   │   │   ├── insights.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── meta.routes.ts
│   │   │   └── pages.routes.ts
│   │   ├── controllers/              (thin controllers, call services)
│   │   ├── services/
│   │   │   ├── git/
│   │   │   │   ├── git.service.ts    (core git operations)
│   │   │   │   ├── diff.service.ts   (diff generation + parsing)
│   │   │   │   ├── archive.service.ts (zip/tar generation)
│   │   │   │   ├── lfs.service.ts    (LFS operations)
│   │   │   │   └── hooks.service.ts  (hook execution)
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── token.service.ts
│   │   │   │   └── oauth.service.ts
│   │   │   ├── repo.service.ts
│   │   │   ├── issue.service.ts
│   │   │   ├── pull.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── webhook.service.ts
│   │   │   ├── search.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── codespace.service.ts
│   │   │   ├── ci.service.ts
│   │   │   ├── package.service.ts
│   │   │   ├── security.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── workers/
│   │   │   ├── queue.ts              (BullMQ setup)
│   │   │   ├── jobs/
│   │   │   │   ├── webhook.job.ts
│   │   │   │   ├── email.job.ts
│   │   │   │   ├── searchIndex.job.ts
│   │   │   │   ├── ciRunner.job.ts
│   │   │   │   ├── dependabot.job.ts
│   │   │   │   ├── secretScan.job.ts
│   │   │   │   ├── cleanup.job.ts
│   │   │   │   └── stats.job.ts
│   │   ├── ssh/
│   │   │   ├── server.ts             (SSH server using ssh2)
│   │   │   ├── auth.ts               (public key validation)
│   │   │   └── handler.ts            (git command routing)
│   │   ├── realtime/
│   │   │   └── socket.ts             (Socket.io setup + rooms)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         (complete schema)
│   │   │   └── migrations/           (all migrations)
│   │   ├── emails/
│   │   │   ├── Welcome.tsx           (React Email templates)
│   │   │   ├── PasswordReset.tsx
│   │   │   ├── EmailVerification.tsx
│   │   │   ├── Notification.tsx
│   │   │   └── SecurityAlert.tsx
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── crypto.ts
│   │       ├── diff.ts
│   │       ├── fileIcons.ts
│   │       └── semver.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── router.tsx                (all routes defined)
    │   ├── styles/
    │   │   ├── globals.css           (CSS variables, reset, typography)
    │   │   └── themes/               (dark, light, high-contrast)
    │   ├── lib/
    │   │   ├── api/
    │   │   │   ├── client.ts         (Axios/fetch wrapper, auth headers)
    │   │   │   └── endpoints/        (typed API call functions)
    │   │   ├── supabase.ts           (Supabase client)
    │   │   ├── utils.ts
    │   │   ├── dates.ts
    │   │   ├── markdown.ts
    │   │   └── shortcuts.ts          (keyboard shortcut registry)
    │   ├── components/
    │   │   ├── ui/                   (VeteranUI component library)
    │   │   ├── layout/
    │   │   │   ├── AppShell.tsx      (header + sidebar + main)
    │   │   │   ├── Header.tsx        (search, notifications, user menu)
    │   │   │   ├── Sidebar.tsx       (repo nav, user nav)
    │   │   │   ├── CommandPalette.tsx
    │   │   │   └── Footer.tsx
    │   │   ├── repo/
    │   │   │   ├── FileTree.tsx
    │   │   │   ├── FileViewer.tsx
    │   │   │   ├── CodeEditor.tsx    (Monaco wrapper)
    │   │   │   ├── CommitList.tsx
    │   │   │   ├── CommitGraph.tsx   (D3)
    │   │   │   ├── DiffViewer.tsx    (diff2html wrapper)
    │   │   │   ├── BlameView.tsx
    │   │   │   ├── BranchSelector.tsx
    │   │   │   ├── RepoHeader.tsx
    │   │   │   └── CloneDialog.tsx
    │   │   ├── issues/
    │   │   │   ├── IssueList.tsx
    │   │   │   ├── IssueDetail.tsx
    │   │   │   ├── IssueTimeline.tsx
    │   │   │   ├── CommentBox.tsx    (TipTap editor)
    │   │   │   ├── LabelPicker.tsx
    │   │   │   └── MilestonePicker.tsx
    │   │   ├── pulls/
    │   │   │   ├── PRList.tsx
    │   │   │   ├── PRDetail.tsx
    │   │   │   ├── PRDiff.tsx
    │   │   │   ├── ReviewBox.tsx
    │   │   │   ├── InlineComment.tsx
    │   │   │   └── MergeBox.tsx
    │   │   ├── actions/
    │   │   │   ├── WorkflowList.tsx
    │   │   │   ├── RunDetail.tsx
    │   │   │   ├── JobGraph.tsx      (DAG visualization)
    │   │   │   └── LogViewer.tsx     (ANSI + live stream)
    │   │   ├── codespaces/
    │   │   │   ├── CodespaceList.tsx
    │   │   │   ├── CreateCodespace.tsx
    │   │   │   └── CodespaceIDE.tsx  (full VS Code in iframe)
    │   │   ├── notifications/
    │   │   │   ├── NotificationBell.tsx
    │   │   │   └── NotificationInbox.tsx
    │   │   ├── projects/
    │   │   │   ├── BoardView.tsx     (dnd-kit kanban)
    │   │   │   ├── TableView.tsx     (TanStack Table)
    │   │   │   └── RoadmapView.tsx   (D3 Gantt)
    │   │   ├── insights/
    │   │   │   ├── ContribGraph.tsx  (heatmap)
    │   │   │   ├── ContribGlobe.tsx  (Three.js)
    │   │   │   └── InsightCharts.tsx (Recharts)
    │   │   └── shared/
    │   │       ├── MarkdownRenderer.tsx
    │   │       ├── RichTextEditor.tsx (TipTap)
    │   │       ├── SearchBar.tsx
    │   │       ├── AvatarStack.tsx
    │   │       └── PermissionGate.tsx
    │   ├── pages/              (one file per route)
    │   ├── stores/
    │   │   ├── authStore.ts
    │   │   ├── notificationStore.ts
    │   │   ├── themeStore.ts
    │   │   └── shortcutStore.ts
    │   ├── hooks/
    │   │   ├── useRepo.ts
    │   │   ├── useIssues.ts
    │   │   ├── usePulls.ts
    │   │   ├── useNotifications.ts
    │   │   └── useRealtime.ts
    │   └── types/              (TypeScript types, imported from @veteran/shared)
    ├── tests/
    │   ├── unit/
    │   └── e2e/               (Playwright)
    ├── public/
    │   ├── icons/             (file type icons — Seti theme)
    │   └── og/                (default OG images)
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── package.json

═══════════════════════════════════════════════════════════════════════════════════
🐳  DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════════════

  Dockerfile (multi-stage):
  Stage 1 (deps):     Install all node_modules
  Stage 2 (frontend): Build Next.js/Vite static output
  Stage 3 (backend):  Build Express TypeScript
  Stage 4 (runner):   Minimal node:20-alpine, copy built artifacts
                      Install nginx, supervisord, git, openssh-server
                      Copy nginx.conf, supervisord.conf
                      EXPOSE 7860 2222 4873
                      CMD supervisord
  
  All persistent data in /data:
  /data/repos/         bare git repositories (owner/repo.git)
  /data/repos-wiki/    wiki repos (owner/repo.wiki.git)
  /data/lfs/           LFS objects (content-addressed)
  /data/uploads/       user avatars, org logos, release assets
  /data/packages/      npm/docker/other packages
  /data/codespaces/    codespace container volumes
  /data/ci/            CI artifacts
  /data/backups/       automated backups
  /data/logs/          application + nginx logs
  /data/ssh/           SSH host keys
  
  .env.example (fully documented, 100+ variables):
  # Core
  APP_URL=https://veteran.yourdomain.com
  APP_NAME=Veteran
  APP_SECRET=<32-char random>
  NODE_ENV=production
  PORT=3000
  
  # Supabase
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  DATABASE_URL=postgresql://...
  
  # Redis
  REDIS_URL=redis://localhost:6379
  
  # JWT
  JWT_PRIVATE_KEY=<RS256 private key>
  JWT_PUBLIC_KEY=<RS256 public key>
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=30d
  
  # OAuth
  GITHUB_CLIENT_ID=
  GITHUB_CLIENT_SECRET=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GITLAB_CLIENT_ID=
  GITLAB_CLIENT_SECRET=
  
  # Email
  SMTP_HOST=
  SMTP_PORT=587
  SMTP_USER=
  SMTP_PASS=
  EMAIL_FROM=noreply@veteran.app
  
  # Storage
  DATA_PATH=/data
  MAX_REPO_SIZE_MB=5120
  MAX_LFS_SIZE_MB=2048
  MAX_UPLOAD_SIZE_MB=100
  
  # Features
  REGISTRATION_ENABLED=true
  EMAIL_VERIFICATION_REQUIRED=true
  CODESPACES_ENABLED=true
  PACKAGES_ENABLED=true
  AI_SEARCH_ENABLED=false
  
  # Admin
  ADMIN_USERNAME=admin
  ADMIN_EMAIL=admin@veteran.app
  ADMIN_PASSWORD=<set on first run>
  
  # Codespaces
  CODESPACE_DOCKER_NETWORK=veteran_codespaces
  CODESPACE_MAX_PER_USER=5
  CODESPACE_IDLE_TIMEOUT_MIN=30
  
  # CI
  CI_RUNNER_CONCURRENCY=4
  CI_JOB_TIMEOUT_MIN=60
  CI_LOG_MAX_SIZE_MB=10
  
  # Security
  BCRYPT_ROUNDS=12
  SESSION_SECRET=
  CSRF_SECRET=
  
  # Monitoring
  PROMETHEUS_ENABLED=true
  SENTRY_DSN=
  POSTHOG_KEY=

═══════════════════════════════════════════════════════════════════════════════════
✅  QUALITY & TESTING
═══════════════════════════════════════════════════════════════════════════════════

  Every page:
  ✓ Loading state (skeleton)
  ✓ Error state (error boundary + retry)
  ✓ Empty state (with CTA)
  ✓ 404 state
  ✓ No permission state (403)
  
  Every form:
  ✓ Client-side validation (Zod + React Hook Form)
  ✓ Server-side validation (Zod)
  ✓ Field-level error messages
  ✓ Submit loading state
  ✓ Success feedback (toast)
  ✓ Optimistic updates where appropriate
  
  Every API:
  ✓ Authentication check
  ✓ Authorization check (repo permissions, org roles)
  ✓ Input validation
  ✓ Error handling with proper HTTP codes
  ✓ Rate limiting
  ✓ Audit logging for mutations
  ✓ Response caching headers
  
  Performance:
  ✓ Database indexes on all FK, search, and sort fields
  ✓ Eager loading (no N+1 queries anywhere)
  ✓ Redis caching for expensive computations
  ✓ Virtual scrolling for long lists (TanStack Virtual)
  ✓ Code splitting per route (dynamic imports)
  ✓ Image optimization (next/image or vite-imagetools)
  ✓ Bundle size < 200KB initial JS (excluding Monaco)
  ✓ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
  ✓ Git operations run in worker_threads (never block event loop)
  ✓ Streaming responses for large diffs / logs
  ✓ Pagination on all list endpoints
  
  Testing:
  ✓ Unit tests for all service functions (Vitest)
  ✓ Integration tests for all API endpoints (Supertest)
  ✓ E2E tests for critical paths (Playwright):
      - Sign up, verify email, login, logout
      - Create repo, push via HTTP, view file
      - Create issue, comment, close
      - Create PR, review, merge
      - Create org, add member, add team
      - Run workflow, view logs
      - Create codespace, edit file, stop

NOW BUILD THE COMPLETE PLATFORM.

Build every file listed in the file structure.
Every component, every service, every route, every migration.
Every feature described above — fully functional, zero placeholders.
Start from the Dockerfile and work inward.
The final output must be a complete, deployable, production-ready codebase
for VETERAN — the Git platform that makes GitHub obsolete.