import process from 'node:process';
import { apiRequest, fetchAllRepositories, parseArgs } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const repoSelector = args.repo || args.id || '';

if (!repoSelector) {
  console.error('Usage: node scripts/annotate.mjs --repo "owner/name" --note "..." --status "want-to-try" --tags "ai,agent"');
  process.exit(1);
}

try {
  const repositories = await fetchAllRepositories(args);
  const matched = repositories.find((repo) =>
    String(repo.id) === repoSelector
    || repo.full_name === repoSelector
    || repo.name === repoSelector
  );

  if (!matched) {
    throw new Error(`Repository not found: ${repoSelector}`);
  }

  const updates = {
    ...(args.note !== undefined ? { custom_description: args.note } : {}),
    ...(args.status !== undefined ? { custom_category: args.status } : {}),
    ...(args.tags !== undefined
      ? {
          custom_tags: args.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }
      : {}),
    ...(args.subscribe !== undefined ? { subscribed_to_releases: args.subscribe === 'true' } : {}),
    last_edited: new Date().toISOString(),
  };

  const updated = await apiRequest(`/api/repositories/${matched.id}`, {
    args,
    method: 'PATCH',
    body: updates,
  });

  console.log(`# Updated ${updated.full_name}`);
  console.log('');
  console.log(`- status: ${updated.custom_category || 'none'}`);
  console.log(`- why: ${updated.custom_description || 'none'}`);
  console.log(`- tags: ${Array.isArray(updated.custom_tags) ? updated.custom_tags.join(', ') || 'none' : 'none'}`);
  console.log(`- subscribed_to_releases: ${updated.subscribed_to_releases ? 'true' : 'false'}`);
} catch (error) {
  console.error(`Annotate failed: ${error.message}`);
  process.exitCode = 1;
}
