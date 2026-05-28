import process from 'node:process';
import {
  apiRequest,
  buildRepoMap,
  fetchAllRepositories,
  fetchGitHubStarred,
  mergeStarredRepo,
  parseArgs,
} from './common.mjs';

const args = parseArgs(process.argv.slice(2));

try {
  const existingRepositories = await fetchAllRepositories(args);
  const existingById = buildRepoMap(existingRepositories);
  const starred = await fetchGitHubStarred(args);

  const repositories = starred.map((item) => {
    const repo = item?.repo ?? item;
    return mergeStarredRepo(item, existingById.get(repo.id));
  });

  if (args['dry-run'] === 'true') {
    console.log('# Sync Preview');
    console.log('');
    console.log(`- existing repositories: ${existingRepositories.length}`);
    console.log(`- fetched starred repositories: ${repositories.length}`);
    process.exit(0);
  }

  await apiRequest('/api/repositories', {
    args,
    method: 'PUT',
    body: {
      repositories,
      isFullSync: true,
    },
  });

  console.log('# GitHub Stars Sync Complete');
  console.log('');
  console.log(`- repositories synced: ${repositories.length}`);
  console.log('- preserved fields: ai_summary, ai_tags, ai_platforms, custom_description, custom_tags, custom_category');
} catch (error) {
  console.error(`Sync failed: ${error.message}`);
  process.exitCode = 1;
}
