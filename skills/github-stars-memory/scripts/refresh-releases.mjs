import process from 'node:process';
import {
  fetchAllRepositories,
  fetchGitHubReleases,
  matchRepository,
  parseArgs,
  upsertReleases,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const repoSelector = args.repo || '';
const perRepo = Number.parseInt(args['per-repo'] || '20', 10);
const maxRepos = Number.parseInt(args['max-repos'] || '100', 10);
const subscribedOnly = args['subscribed-only'] !== 'false';

try {
  const repositories = await fetchAllRepositories(args);
  let targets = repositories;

  if (repoSelector) {
    targets = repositories.filter((repo) => matchRepository(repo, repoSelector));
  } else if (subscribedOnly) {
    targets = repositories.filter((repo) => repo.subscribed_to_releases);
  }

  targets = targets.slice(0, Math.max(1, maxRepos));

  if (targets.length === 0) {
    console.log('# Release Refresh');
    console.log('');
    console.log('No repositories matched the refresh filter.');
    process.exit(0);
  }

  const allReleases = [];
  const failures = [];

  for (const repo of targets) {
    try {
      const releases = await fetchGitHubReleases(repo.full_name, args, { perPage: perRepo });
      for (const release of releases) {
        allReleases.push({
          id: release.id,
          tag_name: release.tag_name,
          name: release.name || release.tag_name,
          body: release.body || '',
          html_url: release.html_url,
          published_at: release.published_at,
          prerelease: release.prerelease ?? false,
          draft: release.draft ?? false,
          is_read: false,
          assets: Array.isArray(release.assets) ? release.assets : [],
          zipball_url: release.zipball_url ?? null,
          tarball_url: release.tarball_url ?? null,
          repository: {
            id: repo.id,
            full_name: repo.full_name,
            name: repo.name,
          },
        });
      }
    } catch (error) {
      failures.push({
        repository: repo.full_name,
        error: error.message,
      });
    }
  }

  if (args['dry-run'] === 'true') {
    console.log('# Release Refresh Preview');
    console.log('');
    console.log(`- repositories targeted: ${targets.length}`);
    console.log(`- releases fetched: ${allReleases.length}`);
    console.log(`- failures: ${failures.length}`);
    process.exit(0);
  }

  const result = await upsertReleases(allReleases, args);

  console.log('# Release Refresh Complete');
  console.log('');
  console.log(`- repositories targeted: ${targets.length}`);
  console.log(`- releases upserted: ${result?.upserted ?? allReleases.length}`);
  console.log(`- failures: ${failures.length}`);

  if (failures.length > 0) {
    console.log('');
    console.log('Failed repositories:');
    for (const failure of failures.slice(0, 10)) {
      console.log(`- ${failure.repository}: ${failure.error}`);
    }
  }
} catch (error) {
  console.error(`Release refresh failed: ${error.message}`);
  process.exitCode = 1;
}
