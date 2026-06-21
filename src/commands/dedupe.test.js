import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findDuplicates, deduplicateEntries, dedupeCommand } from './dedupe.js';
import * as storage from '../storage.js';

vi.mock('../storage.js');

const makeEntry = (url, tags = [], id = url) => ({ id, url, tags, addedAt: new Date().toISOString() });

describe('findDuplicates', () => {
  it('returns empty object when no duplicates', () => {
    const entries = [makeEntry('https://a.com'), makeEntry('https://b.com')];
    expect(findDuplicates(entries)).toEqual({});
  });

  it('detects duplicate URLs case-insensitively', () => {
    const entries = [
      makeEntry('https://A.com', [], '1'),
      makeEntry('https://a.com', [], '2'),
    ];
    const dups = findDuplicates(entries);
    expect(Object.keys(dups)).toHaveLength(1);
    expect(dups['https://a.com']).toHaveLength(2);
  });
});

describe('deduplicateEntries', () => {
  it('keeps only one entry per URL', () => {
    const entries = [
      makeEntry('https://a.com', ['news'], '1'),
      makeEntry('https://a.com', ['tech'], '2'),
      makeEntry('https://b.com', [], '3'),
    ];
    const result = deduplicateEntries(entries);
    expect(result).toHaveLength(2);
  });

  it('merges tags from duplicates into the first entry', () => {
    const entries = [
      makeEntry('https://a.com', ['news'], '1'),
      makeEntry('https://a.com', ['tech', 'news'], '2'),
    ];
    const result = deduplicateEntries(entries);
    expect(result[0].tags).toContain('news');
    expect(result[0].tags).toContain('tech');
    expect(result[0].tags).toHaveLength(2);
  });

  it('returns all entries when no duplicates exist', () => {
    const entries = [makeEntry('https://a.com'), makeEntry('https://b.com')];
    expect(deduplicateEntries(entries)).toHaveLength(2);
  });
});

describe('dedupeCommand', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports empty queue', async () => {
    storage.loadQueue.mockResolvedValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await dedupeCommand();
    expect(spy).toHaveBeenCalledWith('Queue is empty.');
    spy.mockRestore();
  });

  it('reports no duplicates found', async () => {
    storage.loadQueue.mockResolvedValue([makeEntry('https://a.com')]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await dedupeCommand();
    expect(spy).toHaveBeenCalledWith('No duplicates found.');
    spy.mockRestore();
  });

  it('removes duplicates and saves', async () => {
    const entries = [
      makeEntry('https://a.com', [], '1'),
      makeEntry('https://a.com', [], '2'),
      makeEntry('https://b.com', [], '3'),
    ];
    storage.loadQueue.mockResolvedValue(entries);
    storage.saveQueue.mockResolvedValue();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await dedupeCommand();
    expect(storage.saveQueue).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ url: 'https://a.com' })]));
    expect(spy.mock.calls[0][0]).toMatch(/Removed 1 duplicate/);
    spy.mockRestore();
  });

  it('dry run does not save', async () => {
    const entries = [
      makeEntry('https://a.com', [], '1'),
      makeEntry('https://a.com', [], '2'),
    ];
    storage.loadQueue.mockResolvedValue(entries);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await dedupeCommand({ dryRun: true });
    expect(storage.saveQueue).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
