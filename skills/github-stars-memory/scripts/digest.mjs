import process from 'node:process';
import {
  fetchAllReleases,
  fetchAllRepositories,
  formatDate,
  parseArgs,
  withinLastDays,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const days = Number.parseInt(args.days || process.env.GITHUB_STARS_MEMORY_RELEASE_WINDOW_DAYS || '14', 10);
const limit = Number.parseInt(args.limit || '10', 10);
const subscribedOnly = args['subscribed-only'] !== 'false';
const unreadOnly = args.unread === 'true';

try {
  const repositories = await fetchAllRepositories(args);
  const releases = await fetchAllReleases(args);
  const subscribedRepoIds = new Set(
    repositories
      .filter((repo) => repo.subscribed_to_releases)
      .map((repo) => repo.id)
  );

  const filtered = releases
    .filter((release) => withinLastDays(release.published_at, days))
    .filter((release) => (subscribedOnly ? subscribedRepoIds.has(release.repository?.id) : true))
    .filter((release) => (unreadOnly ? !release.is_read : true))
    .sort((left, right) => new Date(right.published_at).getTime() - new Date(left.published_at).getTime())
    .slice(0, Math.max(1, limit));

  console.log(`# Release Digest (${days} days)`);
  console.log('');

  if (filtered.length === 0) {
    console.log('No matching releases were found in the local store.');
    if (subscribedOnly && subscribedRepoIds.size === 0) {
      console.log('');
      console.log('Tip: no repositories are currently marked as subscribed_to_releases.');
    }
    process.exit(0);
  }

  for (const [index, release] of filtered.entries()) {
    const assetCount = Array.isArray(release.assets) ? release.assets.length : 0;
    console.log(`${index + 1}. ${release.repository?.full_name || 'unknown repo'} :: ${release.tag_name}`);
    console.log(`   published: ${formatDate(release.published_at)} | unread: ${release.is_read ? 'no' : 'yes'} | assets: ${assetCount}`);
    console.log(`   title: ${release.name || release.tag_name}`);
    console.log(`   url: ${release.html_url || 'none'}`);
    console.log('');
  }
} catch (error) {
  console.error(`Digest failed: ${error.message}`);
  process.exitCode = 1;
}
