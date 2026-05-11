# PRD: Environment Variables Strategy for JBRTECHNO Monorepo

> **Status:** Draft (pending decisions in §10)
> **Date:** 2026-05-10
> **Owner:** Engineering team
> **Sources:** Verified against Vercel official docs & Turborepo v2 docs via Context7 (2026-05-10)

---

## 1. Problem Statement

Currently:
- `Homepage/.env` and `dashboard/.env` are committed to git with real production credentials (DATABASE_URL, Cloudinary keys, Clockify, Resend, NEXTAUTH_SECRET).
- Each app duplicates the same shared variables (e.g. `DATABASE_URL`) — changing one means manually changing the other.
- No `.env.example` exists, so onboarding a new teammate requires manual setup based on tribal knowledge.
- After monorepo migration, both apps will share many variables. We need a single source of truth.

We need a strategy that:
1. Removes all real secrets from git.
2. Centralizes shared variables so a change in one place propagates to both apps.
3. Lets teammates onboard quickly with a documented, one-command sync.
4. Plays correctly with Turborepo's caching (env vars affect build hashes).

---

## 2. Goals & Non-Goals

### Goals
- ✅ Real values live only in **Vercel Team Shared Environment Variables** (not in git).
- ✅ Repo contains only `.env.*.example` templates (no values, just keys + comments).
- ✅ One-command local sync: `pnpm env:pull` → both apps get their `.env.local`.
- ✅ Turborepo cache invalidates correctly when env vars change.
- ✅ Clear separation: **shared** vars (DATABASE_URL, Cloudinary) vs **app-specific** vars (AUTH_SECRET for dashboard only).

### Non-Goals
- ❌ NOT building a custom secrets manager (Vercel already provides this).
- ❌ NOT migrating env between cloud providers (Vercel-only for now).
- ❌ NOT encrypting `.env.example` files (they contain no secrets).

---

## 3. Background — Vercel's Actual Model (Verified)

> Source: [vercel.com/docs](https://vercel.com/docs) via Context7

### Vercel offers two levels of environment variables:

| Level | Where managed | Scope | Use case |
|---|---|---|---|
| **Project Environment Variables** | Project Settings → Environment Variables | One project only | App-specific secrets (e.g. dashboard's `AUTH_SECRET`) |
| **Shared Environment Variables** (Team feature) | Team Settings → Environment Variables | Multiple projects in the team | Variables both apps need (e.g. `DATABASE_URL`) |

### Key facts (from Vercel REST API docs):
- Endpoint: `POST /v1/env` creates shared env vars at team level.
- SDK: `vercel.environment.listSharedEnvVariable()`, `updateSharedEnvVariable()`, etc.
- Each shared variable is **linked** to specific projects via `projectId` array.
- Targets supported: `production`, `preview`, `development`.
- Custom environments also supported via `customEnvironmentIds`.

### CLI for local sync (the standard workflow):
```bash
cd apps/homepage
vercel link                    # one-time: link this folder to its Vercel project
vercel env pull .env.local     # pulls all env vars (shared + project-specific) for this project
```

> ⚠️ **`.env.share` is not a Vercel-native filename.** It's a naming choice we're adopting for documentation. The actual values live in Vercel, not in this file.

---

## 4. Background — Turborepo Env Handling (Verified)

> Source: `/vercel/turborepo` Context7 docs

### Three keys matter in `turbo.json`:

| Key | What it does | Example |
|---|---|---|
| `globalEnv` | Env vars that affect **all** task hashes — every task re-runs when they change | `["DATABASE_URL", "NODE_ENV"]` |
| `tasks.<task>.env` | Env vars that affect hash of one specific task | `build.env: ["NEXT_PUBLIC_*"]` |
| `tasks.<task>.inputs` | Files that affect hash — **include `.env*` here so file changes invalidate cache** | `[".env", ".env.local"]` |

### Critical rule (from official docs):
> "Turborepo does not load .env files directly. Frameworks (Next.js) do. You must declare env vars in `env`/`globalEnv` AND include `.env*` files in `inputs` for caching to work correctly."

### Correct vs incorrect:
```json
// ❌ WRONG — .env changes don't invalidate cache
{ "tasks": { "build": { "env": ["DATABASE_URL"] } } }

// ✅ CORRECT — both env vars AND .env files affect cache
{
  "tasks": {
    "build": {
      "env": ["DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.local"]
    }
  }
}
```

### Next.js inlining (gotcha):
`NEXT_PUBLIC_*` variables get **inlined into the build output at build time**. If we don't declare them in `env`, two builds with different values will share a cached output → silent bugs in production. Turborepo auto-detects some Next.js variables but not all.

---

## 5. The Strategy

### 5.1 File layout in the monorepo

```
JBRTECHNO/
├── .env.shared.example        ← Template for team-shared vars (no values)
├── .env.local                  ← (gitignored) optional root-level local override
├── .gitignore                  ← ignores all .env files except .example
├── turbo.json                  ← declares globalEnv from .env.shared
│
├── apps/
│   ├── homepage/
│   │   ├── .env.example         ← Template for homepage-specific vars
│   │   ├── .env.local           ← (gitignored) pulled via `vercel env pull`
│   │   └── package.json
│   │
│   └── dashboard/
│       ├── .env.example         ← Template for dashboard-specific vars (AUTH_SECRET, etc.)
│       ├── .env.local           ← (gitignored) pulled via `vercel env pull`
│       └── package.json
```

### 5.2 What goes where

#### `.env.shared.example` (Vercel Team Shared)
Variables needed by **both** apps. Real values stored in Vercel Team Settings.

```bash
# ============================================================
# JBRTECHNO — Shared Environment Variables
# These are stored in Vercel Team Shared Env Vars.
# Pull locally: `pnpm env:pull` (runs `vercel env pull` per app)
# Never commit real values to git.
# ============================================================

# --- Database ---
DATABASE_URL=                # MongoDB Atlas connection string

# --- Cloudinary (image/CV uploads) ---
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# --- WhatsApp notifications ---
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_NOTIFICATION_NUMBER=

# --- Email (Resend) ---
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

#### `apps/dashboard/.env.example` (Project-specific)
```bash
# Dashboard-specific. Stored as Vercel Project Env Vars on the dashboard project.

# --- NextAuth ---
AUTH_SECRET=
AUTH_URL=
AUTH_TRUST_HOST=true

# --- Clockify (time tracking, dashboard only) ---
CLOCKIFY_API_KEY=
CLOCKIFY_WORKSPACE_ID=

# --- Initial seed (used once, then remove) ---
SUPER_ADMIN_USERNAME=
SUPER_ADMIN_PASSWORD=
```

#### `apps/homepage/.env.example` (Project-specific)
```bash
# Homepage-specific. Stored as Vercel Project Env Vars on the homepage project.

# --- Analytics ---
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# --- Site URLs ---
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_DASHBOARD_URL=
```

### 5.3 `.gitignore` rules
```gitignore
# Env files — never commit real values
.env
.env.local
.env.*.local
.env.production
.env.development

# Allow templates
!.env.shared.example
!.env.example
```

### 5.4 Workflow: local development

**First time (per teammate):**
```bash
# 1. Install Vercel CLI globally
pnpm add -g vercel

# 2. Login to Vercel
vercel login

# 3. From repo root, link each app to its Vercel project
cd apps/homepage && vercel link
cd ../dashboard && vercel link

# 4. Pull env vars for both
cd ../.. && pnpm env:pull
```

**Daily:**
```bash
pnpm dev          # runs both apps via turborepo
pnpm env:pull     # re-sync env if a teammate added a new var
```

### 5.5 Workflow: CI/CD on Vercel
- Each Vercel project (homepage, dashboard) has its **Root Directory** set to `apps/homepage` or `apps/dashboard`.
- Vercel auto-detects Turborepo and runs `turbo build --filter=<app>` for that project.
- Env vars resolve automatically:
  - **Shared** vars are linked at team level → injected into both deployments.
  - **Project** vars are scoped to one project.
- "Include source files outside the Root Directory in the Build Step" must be **ON** (default for projects after Aug 2020).

### 5.6 Workflow: changing a shared variable
1. Teammate updates the value in **Vercel Team Settings → Environment Variables**.
2. The change applies to next deployment automatically.
3. For local dev: each teammate runs `pnpm env:pull` to refresh `.env.local`.
4. No PR, no commit — values live outside git.

---

## 6. `turbo.json` Configuration

Based on official Turborepo v2 docs, this is the correct config for our case:

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "globalEnv": [
    "DATABASE_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    "WHATSAPP_API_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_NOTIFICATION_NUMBER",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "NODE_ENV",
    "CI",
    "VERCEL",
    "VERCEL_URL"
  ],
  "globalPassThroughEnv": ["GITHUB_TOKEN"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["NEXT_PUBLIC_*"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env",
        ".env.local",
        ".env.production",
        ".env.production.local"
      ],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env",
        ".env.local",
        ".env.development",
        ".env.development.local"
      ]
    },
    "lint": {},
    "type-check": {}
  }
}
```

**Why these choices:**
- `globalEnv` includes all shared vars from `.env.shared.example` → any change re-runs every task.
- `env: ["NEXT_PUBLIC_*"]` on `build` ensures all public Next.js vars affect the build hash (they get inlined).
- `inputs` includes `.env*` files → if someone changes a local file, the cache invalidates correctly.
- `dev` task has `cache: false` and `persistent: true` → standard for dev servers.

---

## 7. Root `package.json` Scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "env:pull": "pnpm --filter homepage env:pull && pnpm --filter dashboard env:pull",
    "env:check": "node scripts/check-env.js"
  }
}
```

Each app's `package.json`:
```json
{
  "scripts": {
    "env:pull": "vercel env pull .env.local --yes"
  }
}
```

---

## 8. Migration Plan — Step by Step

> **None of these steps mutate Vercel itself.** That's a manual one-time action through the dashboard.

### Phase A: Inventory & Cleanup (no destructive action)
1. ✅ Read current `Homepage/.env` and `dashboard/.env` → list every variable and its value.
2. ✅ Categorize each variable: shared, homepage-only, dashboard-only, unused-leftover.
3. ✅ Document findings in this PRD section before any deletion.

### Phase B: Vercel Setup (manual, one-time by team lead)
4. ⏳ Create Vercel team if not exists.
5. ⏳ For each **shared** variable: add it in Team Settings → Environment Variables.
6. ⏳ Create 2 Vercel projects (`jbrtechno-homepage`, `jbrtechno-dashboard`).
7. ⏳ Link shared variables to both projects (via UI checkbox or API).
8. ⏳ For each **project-specific** variable: add it under that project's settings.

### Phase C: Repo Changes (after monorepo skeleton is in place)
9. ⏳ Create `.env.shared.example` at repo root.
10. ⏳ Create `apps/homepage/.env.example` and `apps/dashboard/.env.example`.
11. ⏳ Update `.gitignore` to exclude real `.env*` files but allow `.example`.
12. ⏳ Write `turbo.json` with `globalEnv` from §6.
13. ⏳ Add `env:pull` scripts to root and each app's `package.json`.
14. ⏳ Write `scripts/check-env.js` (lints presence of required vars before `dev`/`build`).

### Phase D: Secret Rotation (CRITICAL)
> Since real secrets are currently in git history, they are **compromised** and must be rotated.

15. 🔴 Rotate MongoDB connection string (new password on Atlas).
16. 🔴 Rotate Cloudinary API key + secret.
17. 🔴 Rotate Clockify API key.
18. 🔴 Rotate Resend API key.
19. 🔴 Generate new `AUTH_SECRET` (via `openssl rand -base64 32`).
20. 🔴 Generate new WhatsApp tokens if applicable.
21. ⏳ Update Vercel with new values.
22. ⏳ Update local `.env.local` via `pnpm env:pull`.

### Phase E: Remove Old `.env` from Git History
23. ⏳ `git rm --cached Homepage/.env dashboard/.env`
24. ⏳ Commit removal.
25. ⏳ Use `git filter-repo` or BFG to scrub historical commits (optional but recommended).
26. ⏳ Force push only after team coordination.

### Phase F: Verification
27. ⏳ Fresh clone of repo on a clean machine.
28. ⏳ Run `pnpm install && pnpm env:pull && pnpm dev`.
29. ⏳ Both apps start with full functionality.
30. ⏳ Run `pnpm build` for both apps and confirm zero env-related errors.

---

## 9. Verification Checklist

A teammate cloning fresh should be able to:
- [ ] `git clone` the repo.
- [ ] `pnpm install` succeeds with no missing peer deps.
- [ ] `vercel login && vercel link` succeeds in each app.
- [ ] `pnpm env:pull` creates `.env.local` in both apps with all required vars.
- [ ] `pnpm dev` starts both apps without env-related errors.
- [ ] `pnpm build` for both apps succeeds.
- [ ] No real secrets exist anywhere in `git status` or git history (post-cleanup).

---

## 10. Open Decisions (Need Your Input)

Before we execute the plan, decide on these:

### D1: Naming — `.env.shared.example` vs `.env.share.example`?
- Vercel's feature is officially called **"Shared Environment Variables"** (with `d`).
- I recommend **`.env.shared.example`** for consistency with the official term.
- ⏳ Your call.

### D2: Single Vercel team or already exists?
- Do you have an existing Vercel team for JBRTECHNO?
- If not, we create one as the first manual step.
- ⏳ Your call.

### D3: Custom environments?
- Vercel supports custom env scopes (e.g. `staging`, `qa`) beyond `production`/`preview`/`development`.
- For now I assume only the 3 defaults. Confirm or extend.
- ⏳ Your call.

### D4: Git history cleanup — do or skip?
- Real secrets are in current git history.
- Rotating secrets (Phase D) is mandatory regardless.
- Scrubbing history (Phase E.25) is recommended but takes coordination (force push, all teammates re-clone).
- ⏳ Your call.

### D5: When to execute Phase B (Vercel manual setup)?
- Before, during, or after the monorepo skeleton?
- I recommend **after** the monorepo is set up but **before** we delete the old `.env` files.
- ⏳ Your call.

### D6: Do you want a `scripts/check-env.js` validator?
- Lints required env vars before `dev`/`build`, fails fast with a clear message.
- Adds ~30 lines of Node.js.
- ⏳ Your call (yes/no).

---

## 11. References

All facts in this PRD are verified against official sources via Context7 on 2026-05-10:

- **Vercel Shared Env Vars (REST API):** `POST /v1/env`, `vercel.environment.listSharedEnvVariable()` — [vercel.com/docs](https://vercel.com/docs)
- **Vercel Monorepo deployment:** [vercel.com/docs/monorepos](https://vercel.com/docs/monorepos)
- **Vercel CLI `env pull`:** standard local-sync command
- **Turborepo env handling:** `globalEnv`, `env`, `passThroughEnv`, `inputs` — [vercel/turborepo on GitHub](https://github.com/vercel/turborepo) and [turborepo.com/docs](https://turborepo.com/docs)
- **Turborepo Next.js gotcha:** `NEXT_PUBLIC_*` inlining + cache — official docs gotcha file

---

## 12. Out of Scope (Future Work)

- Encrypted local `.env.vault` (dotenv-vault) — not needed since Vercel handles storage.
- Multi-cloud env sync (AWS Secrets Manager, etc.) — not needed.
- GitHub Actions env injection — handled by Vercel's GitHub integration if/when CI is added.
