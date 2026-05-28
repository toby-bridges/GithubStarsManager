import process from 'node:process';
import { apiRequest } from './common.mjs';

try {
  const health = await apiRequest('/api/health');
  const repositories = await apiRequest('/api/repositories?limit=1&page=1');
  const releases = await apiRequest('/api/releases?limit=1&page=1');
  const settings = await apiRequest('/api/settings');

  console.log('# GitHub Stars Memory Health');
  console.log('');
  console.log(`- status: ${health?.status ?? 'unknown'}`);
  console.log(`- repositories: ${repositories?.total ?? 0}`);
  console.log(`- releases: ${releases?.total ?? 0}`);
  console.log(`- github_token_status: ${settings?.github_token_status ?? 'empty'}`);
  console.log('');
  console.log('Bridge is reachable.');
} catch (error) {
  console.error(`Health check failed: ${error.message}`);
  process.exitCode = 1;
}
