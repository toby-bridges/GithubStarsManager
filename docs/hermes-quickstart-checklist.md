# Hermes Quickstart Checklist

Use this on the machine that already has Hermes installed.

## 1. Clone

```bash
git clone https://github.com/toby-bridges/GithubStarsManager.git
cd GithubStarsManager
```

## 2. Start Backend

Only the backend dependencies are required for the current Hermes workflow.

```bash
cd server
npm install
npm run dev
```

Optional if backend auth is enabled:

```bash
export GITHUB_STARS_MEMORY_API_SECRET="your-secret"
```

## 3. Register Skills In Hermes

Add to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/GithubStarsManager/skills
```

Restart Hermes or reset the current session.

## 4. Save GitHub Token

```bash
node skills/github-stars-memory/scripts/set-github-token.mjs --token "ghp_..."
```

## 5. Dogfood Loop

```bash
node skills/github-stars-memory/scripts/health.mjs
node skills/github-stars-memory/scripts/sync-stars.mjs
node skills/github-stars-memory/scripts/find.mjs --query "macos automation"
node skills/github-stars-memory/scripts/annotate.mjs --repo "owner/name" --note "why this matters"
node skills/github-stars-memory/scripts/refresh-releases.mjs --subscribed-only true
node skills/github-stars-memory/scripts/digest.mjs --days 14 --limit 10
```

## Success Check

- `health` shows backend reachable
- `sync-stars` pulls your starred repos
- `find` returns a repo you actually wanted
- `annotate` writes your private note/status
- `digest` shows recent releases after refresh

## What You Do Not Need

- you do not need to install the root frontend dependencies
- you do not need to run the React app
- you do not need to build Electron
- the skill scripts themselves only use Node built-ins
