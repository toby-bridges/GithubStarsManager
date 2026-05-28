---
name: github-stars-memory
description: Recall and annotate your GitHub starred repos.
version: 0.1.0
author: li9292
license: MIT
platforms:
  - macos
  - linux
required_environment_variables:
  - name: GITHUB_STARS_MEMORY_API_SECRET
    prompt: GithubStarsManager API secret
    help: Only needed when the local backend is running with API_SECRET enabled.
    required_for: authenticated backend access
metadata:
  hermes:
    category: productivity
    tags:
      - github
      - stars
      - memory
      - releases
    config:
      github_stars_memory.server_url:
        label: GithubStarsManager Server URL
        description: Local backend URL used by the Hermes bridge scripts.
        type: string
        default: http://127.0.0.1:3000
      github_stars_memory.release_window_days:
        label: Release Digest Window
        description: Default number of days to include in digest summaries.
        type: number
        default: 14
---

# GitHub Stars Memory

## When to Use

Use this skill when the user wants to work with GitHub starred repositories through Hermes instead of opening the existing web app directly.

This skill is best for:

- checking whether the local bridge is healthy
- saving the GitHub token into the existing backend
- syncing starred repositories from GitHub into the existing data store
- finding previously starred repositories by intent
- annotating a repository with private rationale, tags, or status
- refreshing recent release data for tracked repositories
- reviewing recent release activity from already tracked repositories

## Procedure

1. Confirm the local backend is reachable.
   Run:
   `node scripts/health.mjs`
   If the configured backend URL is not the default, pass `--server "<url>"`.

2. If `github_token_status` is empty, save the GitHub token first.
   Run:
   `node scripts/set-github-token.mjs --token "..."` 

3. If the user wants fresh starred repositories, sync first.
   Run:
   `node scripts/sync-stars.mjs`

4. If the user wants to find a repo, search with the query text.
   Run:
   `node scripts/find.mjs --query "..." --limit 10`

5. If the user wants to record why they starred something, update the repository note or status.
   Run:
   `node scripts/annotate.mjs --repo "owner/name" --note "..." --status "want-to-try"`

6. If the user wants a release review, refresh the tracked repositories first when freshness matters.
   Run:
   `node scripts/refresh-releases.mjs --subscribed-only true`
   Then run:
   `node scripts/digest.mjs --days 14 --limit 10`

## Output Style

Prefer concise markdown output:

- repository name and link
- why it matters now
- current note/status if present
- release date and tag when discussing updates

## Pitfalls

- This skill assumes the GithubStarsManager backend is already set up and reachable.
- Backend auth is supported through `GITHUB_STARS_MEMORY_API_SECRET` or `--secret`.
- GitHub sync also requires a GitHub token saved into backend settings.
- `sync-stars` refreshes repository data only. It does not fetch release history yet.
- `refresh-releases` pulls current release data through the existing backend proxy.
- `digest` summarizes existing release records. If release data is stale or empty, say so plainly.
- Preserve existing user edits. Do not overwrite custom notes or tags unless the user asked for it.

## Verification

After updates:

- confirm the repository exists in the local store
- show the saved note/status in the response
- mention when data may still need a refresh from the underlying app

## References

For command behavior and local setup expectations, read:

- `references/workflows.md`
