import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchPRMetadata } from '../bitbucket.js';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('fetchPRMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BITBUCKET_ACCESS_TOKEN;
  });

  it('returns null when BITBUCKET_ACCESS_TOKEN is not set', async () => {
    const result = await fetchPRMetadata('myorg', 'myrepo', '3');
    expect(result).toBeNull();
  });

  it('returns null when prId is undefined', async () => {
    process.env.BITBUCKET_ACCESS_TOKEN = 'token';
    const result = await fetchPRMetadata('myorg', 'myrepo', undefined);
    expect(result).toBeNull();
  });

  it('returns PR data on success', async () => {
    process.env.BITBUCKET_ACCESS_TOKEN = 'token';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: 'Fix bug',
        description: { raw: 'Fixes the thing' },
        author: { display_name: 'Bob' },
      }),
    });
    const result = await fetchPRMetadata('myorg', 'myrepo', '3');
    expect(result?.title).toBe('Fix bug');
    expect(result?.description).toBe('Fixes the thing');
  });
});
