# Workflows

## Local Setup

The current bridge assumes the GithubStarsManager backend is reachable on a local URL such as `http://127.0.0.1:3000`.

The command examples below assume you are already inside `skills/github-stars-memory/`.

If you run from the repository root instead, prefix commands with `skills/github-stars-memory/`.

To make Hermes discover this skill from the local repo, add the external skills directory to Hermes:

```yaml
skills:
  external_dirs:
    - /Users/li9292/Desktop/GitHub star/GithubStarsManager/skills
```

Typical local startup:

```bash
cd /Users/li9292/Desktop/GitHub\ star/GithubStarsManager/server
npm install
npm run dev
```

If `API_SECRET` is enabled on the backend, export it before running the scripts:

```bash
export GITHUB_STARS_MEMORY_API_SECRET="your-secret"
```

If the backend lives at a different URL, export:

```bash
export GITHUB_STARS_MEMORY_SERVER_URL="http://127.0.0.1:3000"
```

If you want to save the GitHub token without passing it on every command, export:

```bash
export GITHUB_STARS_MEMORY_GITHUB_TOKEN="ghp_..."
```

## Current Command Set

### Health

Checks that the local bridge can talk to the backend and reports repo/release counts.

```bash
node scripts/health.mjs
# or from repo root:
node skills/github-stars-memory/scripts/health.mjs
```

### Sync Stars

Pulls starred repositories from GitHub through the existing backend proxy and preserves saved notes, tags, categories, and AI fields.

```bash
node scripts/sync-stars.mjs
# or from repo root:
node skills/github-stars-memory/scripts/sync-stars.mjs
```

If the backend does not have a GitHub token yet, save it first:

```bash
node scripts/set-github-token.mjs --token "ghp_..."
# or from repo root:
node skills/github-stars-memory/scripts/set-github-token.mjs --token "ghp_..."
```

### Find

Ranks repositories against a free-form query by using existing metadata such as name, description, AI summary, tags, and custom notes.

```bash
node scripts/find.mjs --query "macos automation"
# or from repo root:
node skills/github-stars-memory/scripts/find.mjs --query "macos automation"
```

### Annotate

Updates user-owned fields on a repository.

```bash
node scripts/annotate.mjs --repo "owner/name" --note "Track for Hermes workflow ideas" --status "want-to-try" --tags "hermes,automation"
# or from repo root:
node skills/github-stars-memory/scripts/annotate.mjs --repo "owner/name" --note "Track for Hermes workflow ideas" --status "want-to-try" --tags "hermes,automation"
```

### Digest

Summarizes recent release activity already stored in the backend.

```bash
node scripts/digest.mjs --days 14 --limit 10
# or from repo root:
node skills/github-stars-memory/scripts/digest.mjs --days 14 --limit 10
```

### Refresh Releases

Refreshes recent release data from GitHub for subscribed repositories or a single target repository.

```bash
node scripts/refresh-releases.mjs --subscribed-only true
node scripts/refresh-releases.mjs --repo "owner/name"
# or from repo root:
node skills/github-stars-memory/scripts/refresh-releases.mjs --subscribed-only true
```

## Known Gaps

- sync currently refreshes starred repositories only
- semantic recall is heuristic reranking, not embeddings
