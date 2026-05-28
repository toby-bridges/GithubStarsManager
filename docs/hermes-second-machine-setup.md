# Hermes Setup On Another Machine

This repository is designed to be consumed from a different machine that already has Hermes installed.

The preferred setup is:

1. Clone the whole repository
2. Run the existing backend locally
3. Point Hermes at the repo's `skills/` directory through `external_dirs`

This is better than installing only the skill directory because the skill depends on the local GithubStarsManager backend for persistence and GitHub proxying.

## 1. Clone Your Fork

```bash
git clone https://github.com/toby-bridges/GithubStarsManager.git
cd GithubStarsManager
```

## 2. Start The Backend

From the repo root:

```bash
npm run dev:server
```

The backend defaults to `http://127.0.0.1:3000`.

If you use `API_SECRET`, export it before starting the server and before using the skill:

```bash
export GITHUB_STARS_MEMORY_API_SECRET="your-secret"
```

Before the first sync, save your GitHub token into backend settings:

```bash
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
node skills/github-stars-memory/scripts/set-github-token.mjs
```

## 3. Register The Skill Directory In Hermes

Add this to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /absolute/path/to/GithubStarsManager/skills
```

After that, start a new Hermes session or reset the current one.

## 4. First Dogfood Loop

Run these commands through Hermes:

```bash
node skills/github-stars-memory/scripts/health.mjs
node skills/github-stars-memory/scripts/set-github-token.mjs --token "ghp_..."
node skills/github-stars-memory/scripts/sync-stars.mjs
node skills/github-stars-memory/scripts/find.mjs --query "macos automation"
node skills/github-stars-memory/scripts/annotate.mjs --repo "owner/name" --note "why this matters"
node skills/github-stars-memory/scripts/refresh-releases.mjs --subscribed-only true
node skills/github-stars-memory/scripts/digest.mjs --days 14 --limit 10
```

## Notes

- `skills/` is intentionally version-controlled so the repo can act as the installation source.
- `upstream` should keep pointing at `AmintaCCCP/GithubStarsManager`.
- `origin` should point at your own fork.
