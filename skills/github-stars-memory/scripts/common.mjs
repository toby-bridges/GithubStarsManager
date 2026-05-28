import process from 'node:process';

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function getServerUrl(args = {}) {
  return (
    args.server
    || process.env.GITHUB_STARS_MEMORY_SERVER_URL
    || 'http://127.0.0.1:3000'
  ).replace(/\/$/, '');
}

export function getApiSecret(args = {}) {
  return args.secret || process.env.GITHUB_STARS_MEMORY_API_SECRET || '';
}

export async function apiRequest(path, options = {}) {
  const {
    args = {},
    method = 'GET',
    body,
    headers = {},
  } = options;

  const serverUrl = getServerUrl(args);
  const apiSecret = getApiSecret(args);

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (apiSecret) {
    requestHeaders.Authorization = `Bearer ${apiSecret}`;
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${serverUrl}${path}`, {
    method,
    headers: requestHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === 'object' && 'error' in payload && payload.error)
      || `${response.status} ${response.statusText}`;
    throw new Error(String(errorMessage));
  }

  return payload;
}

export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchAllRepositories(args = {}) {
  const payload = await apiRequest('/api/repositories?limit=10000&page=1', { args });
  return Array.isArray(payload?.repositories) ? payload.repositories : [];
}

export async function fetchAllReleases(args = {}) {
  const payload = await apiRequest('/api/releases?limit=10000&page=1', { args });
  return Array.isArray(payload?.releases) ? payload.releases : [];
}

export async function fetchGitHubStarred(args = {}) {
  const perPage = 100;
  let page = 1;
  const results = [];

  while (true) {
    const payload = await apiRequest(
      `/api/proxy/github/user/starred?page=${page}&per_page=${perPage}&sort=updated`,
      {
        args,
        method: 'POST',
        body: {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github.star+json',
          },
        },
      }
    );

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    results.push(...payload);

    if (payload.length < perPage) {
      break;
    }

    page += 1;
  }

  return results;
}

export async function fetchGitHubReleases(fullName, args = {}, options = {}) {
  const perPage = Number.parseInt(options.perPage || '30', 10);
  const [owner, repo] = String(fullName || '').split('/');

  if (!owner || !repo) {
    throw new Error(`Invalid repository name: ${fullName}`);
  }

  const payload = await apiRequest(
    `/api/proxy/github/repos/${owner}/${repo}/releases?per_page=${perPage}`,
    {
      args,
      method: 'POST',
      body: {
        method: 'GET',
      },
    }
  );

  return Array.isArray(payload) ? payload : [];
}

export async function upsertReleases(releases, args = {}) {
  if (!Array.isArray(releases) || releases.length === 0) {
    return { upserted: 0 };
  }

  return apiRequest('/api/releases', {
    args,
    method: 'PUT',
    body: {
      releases,
    },
  });
}

export function buildRepoMap(repositories) {
  return new Map(repositories.map((repo) => [repo.id, repo]));
}

export function mergeStarredRepo(starredItem, existingRepo) {
  const repo = starredItem?.repo ?? starredItem;
  if (!repo || typeof repo !== 'object') {
    throw new Error('Unexpected starred repository payload');
  }

  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count ?? 0,
    language: repo.language ?? null,
    created_at: repo.created_at ?? null,
    updated_at: repo.updated_at ?? null,
    pushed_at: repo.pushed_at ?? null,
    starred_at: starredItem?.starred_at ?? existingRepo?.starred_at ?? null,
    owner: {
      login: repo.owner?.login ?? existingRepo?.owner?.login ?? '',
      avatar_url: repo.owner?.avatar_url ?? existingRepo?.owner?.avatar_url ?? '',
    },
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    ai_summary: existingRepo?.ai_summary ?? null,
    ai_tags: Array.isArray(existingRepo?.ai_tags) ? existingRepo.ai_tags : [],
    ai_platforms: Array.isArray(existingRepo?.ai_platforms) ? existingRepo.ai_platforms : [],
    analyzed_at: existingRepo?.analyzed_at ?? null,
    analysis_failed: existingRepo?.analysis_failed ?? false,
    custom_description: existingRepo?.custom_description ?? null,
    custom_tags: Array.isArray(existingRepo?.custom_tags) ? existingRepo.custom_tags : [],
    custom_category: existingRepo?.custom_category ?? null,
    category_locked: existingRepo?.category_locked ?? false,
    last_edited: existingRepo?.last_edited ?? null,
    subscribed_to_releases: existingRepo?.subscribed_to_releases ?? false,
  };
}

export function normalizeQuery(text) {
  return String(text || '').trim().toLowerCase();
}

export function scoreRepository(repo, query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return 0;

  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return 0;

  const searchableFields = {
    name: String(repo.name || '').toLowerCase(),
    fullName: String(repo.full_name || '').toLowerCase(),
    description: String(repo.description || '').toLowerCase(),
    language: String(repo.language || '').toLowerCase(),
    topics: Array.isArray(repo.topics) ? repo.topics.join(' ').toLowerCase() : '',
    aiSummary: String(repo.ai_summary || '').toLowerCase(),
    aiTags: Array.isArray(repo.ai_tags) ? repo.ai_tags.join(' ').toLowerCase() : '',
    aiPlatforms: Array.isArray(repo.ai_platforms) ? repo.ai_platforms.join(' ').toLowerCase() : '',
    customDescription: String(repo.custom_description || '').toLowerCase(),
    customTags: Array.isArray(repo.custom_tags) ? repo.custom_tags.join(' ').toLowerCase() : '',
    customCategory: String(repo.custom_category || '').toLowerCase(),
  };

  const hasMatch = queryWords.some((word) =>
    Object.values(searchableFields).some((fieldValue) => fieldValue.includes(word))
  );

  if (!hasMatch) return 0;

  let score = 0;

  for (const word of queryWords) {
    if (searchableFields.name.includes(word)) score += 0.4;
    if (searchableFields.fullName.includes(word)) score += 0.35;
    if (searchableFields.description.includes(word)) score += 0.3;
    if (searchableFields.customDescription.includes(word)) score += 0.32;
    if (searchableFields.topics.includes(word)) score += 0.25;
    if (searchableFields.aiTags.includes(word)) score += 0.22;
    if (searchableFields.customTags.includes(word)) score += 0.24;
    if (searchableFields.aiSummary.includes(word)) score += 0.15;
    if (searchableFields.aiPlatforms.includes(word)) score += 0.18;
    if (searchableFields.language.includes(word)) score += 0.12;
    if (searchableFields.customCategory.includes(word)) score += 0.18;
  }

  if (searchableFields.name === normalizedQuery) score += 0.5;
  if (searchableFields.name.includes(normalizedQuery)) score += 0.3;
  if (searchableFields.fullName.includes(normalizedQuery)) score += 0.25;

  score += Math.log10((repo.stargazers_count || 0) + 1) * 0.05;

  return score;
}

export function formatDate(isoString) {
  if (!isoString) return 'unknown';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.toISOString().slice(0, 10);
}

export function withinLastDays(isoString, days) {
  if (!isoString) return false;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return false;
  const windowMs = Number(days) * 24 * 60 * 60 * 1000;
  return Date.now() - date.getTime() <= windowMs;
}

export function matchRepository(repo, selector) {
  return (
    String(repo.id) === String(selector)
    || repo.full_name === selector
    || repo.name === selector
  );
}
