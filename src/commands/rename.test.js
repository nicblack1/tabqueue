import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renameTag } from './rename.js';

vi.mock('../storage.js', () => ({
  loadQueue: vi.fn(),
  saveQueue: vi.fn(),
}));

import { loadQueue, saveQueue } from '../storage.js';

const makeEntry = (url, tags) => ({ id: url, url, tags, addedAt: new Date().toISOString() });

beforeEach(() => {
  vi.clearAllMocks();
  saveQueue.mockResolvedValue(undefined);
});

describe('renameTag', () => {
  it('renames a tag across matching entries', async () => {
    loadQueue.mockResolvedValue([
      makeEntry('https://a.com', ['work', 'dev']),
      makeEntry('https://b.com', ['personal']),
      makeEntry('https://c.com', ['work', 'oss']),
    ]);

    const result = await renameTag('work', 'professional');

    expect(result.affectedCount).toBe(2);
    expect(saveQueue).toHaveBeenCalledOnce();
    const saved = saveQueue.mock.calls[0][0];
    expect(saved[0].tags).toContain('professional');
    expect(saved[0].tags).not.toContain('work');
    expect(saved[2].tags).toContain('professional');
  });

  it('returns affectedCount 0 when tag not found', async () => {
    loadQueue.mockResolvedValue([makeEntry('https://a.com', ['dev'])]);

    const result = await renameTag('missing', 'other');

    expect(result.affectedCount).toBe(0);
    expect(saveQueue).not.toHaveBeenCalled();
  });

  it('throws in strict mode when tag not found', async () => {
    loadQueue.mockResolvedValue([makeEntry('https://a.com', ['dev'])]);

    await expect(renameTag('missing', 'other', { strict: true })).rejects.toThrow(
      'Tag "missing" not found'
    );
  });

  it('throws if old and new tags are the same', async () => {
    loadQueue.mockResolvedValue([]);
    await expect(renameTag('work', 'work')).rejects.toThrow(
      'Old and new tag names must be different'
    );
  });

  it('throws on empty old tag', async () => {
    loadQueue.mockResolvedValue([]);
    await expect(renameTag('', 'new')).rejects.toThrow('non-empty string');
  });

  it('does not duplicate if entry already has new tag', async () => {
    loadQueue.mockResolvedValue([
      makeEntry('https://a.com', ['old', 'new']),
    ]);

    const result = await renameTag('old', 'new');
    const saved = saveQueue.mock.calls[0][0];
    const tagCount = saved[0].tags.filter((t) => t === 'new').length;
    expect(tagCount).toBe(1);
    expect(result.affectedCount).toBe(1);
  });
});
