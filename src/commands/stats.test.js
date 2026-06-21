import { describe, it, expect } from 'vitest';
import { computeStats } from './stats.js';

const makeEntry = (url, tags = []) => ({ url, tags, id: url, addedAt: new Date().toISOString() });

describe('computeStats', () => {
  it('returns zeros for empty queue', () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.untagged).toBe(0);
    expect(stats.topTags).toEqual([]);
    expect(stats.avgTagsPerEntry).toBe(0);
  });

  it('counts total entries', () => {
    const entries = [makeEntry('https://a.com'), makeEntry('https://b.com')];
    expect(computeStats(entries).total).toBe(2);
  });

  it('counts untagged entries', () => {
    const entries = [
      makeEntry('https://a.com', []),
      makeEntry('https://b.com', ['news']),
    ];
    expect(computeStats(entries).untagged).toBe(1);
  });

  it('builds tagCounts correctly', () => {
    const entries = [
      makeEntry('https://a.com', ['dev', 'js']),
      makeEntry('https://b.com', ['dev']),
    ];
    const { tagCounts } = computeStats(entries);
    expect(tagCounts['dev']).toBe(2);
    expect(tagCounts['js']).toBe(1);
  });

  it('returns topTags sorted by count descending', () => {
    const entries = [
      makeEntry('https://a.com', ['a', 'b', 'c']),
      makeEntry('https://b.com', ['a', 'b']),
      makeEntry('https://c.com', ['a']),
    ];
    const { topTags } = computeStats(entries);
    expect(topTags[0].tag).toBe('a');
    expect(topTags[0].count).toBe(3);
    expect(topTags[1].tag).toBe('b');
  });

  it('limits topTags to 5', () => {
    const tags = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const entries = tags.map(t => makeEntry(`https://${t}.com`, [t]));
    expect(computeStats(entries).topTags.length).toBe(5);
  });

  it('calculates avgTagsPerEntry correctly', () => {
    const entries = [
      makeEntry('https://a.com', ['x', 'y']),
      makeEntry('https://b.com', ['z']),
    ];
    expect(computeStats(entries).avgTagsPerEntry).toBe(1.5);
  });
});
