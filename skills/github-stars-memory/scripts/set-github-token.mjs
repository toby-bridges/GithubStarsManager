import process from 'node:process';
import { apiRequest, parseArgs } from './common.mjs';

const args = parseArgs(process.argv.slice(2));
const token = args.token || process.env.GITHUB_STARS_MEMORY_GITHUB_TOKEN || '';

if (!token) {
  console.error('Usage: node scripts/set-github-token.mjs --token "<github-pat>"');
  process.exit(1);
}

try {
  await apiRequest('/api/settings', {
    args,
    method: 'PUT',
    body: {
      github_token: token,
    },
  });

  console.log('# GitHub Token Saved');
  console.log('');
  console.log('- status: github_token updated in backend settings');
  console.log('- next step: run node scripts/sync-stars.mjs');
} catch (error) {
  console.error(`Saving GitHub token failed: ${error.message}`);
  process.exitCode = 1;
}
