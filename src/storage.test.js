import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

// Redirect data dir to a temp location for tests
const tmpDir = path.join(os.tmpdir(), 'tabqueue-test-' + Date.now());
const queueFile = path.join(tmpDir, 'queue.json');

vi.stubEnv('HOME', tmpDir);

import { loadQueue, saveQueue, addEntry, removeEntry, filterByTag } from './storage.js';

beforeEach(() => {
  if (fs.existsSync(queueFile)) fs.unlinkSync(queueFile);
});

afterEach(() => {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('loadQueue', () => {
  it('returns empty array when no file exists', () => {
    expect(loadQueue()).toEqual([]);
  });
});

describe('addEntry', () => {
  it('adds a url entry with tags', () => {
    const entry = addEntry('https://example.com', ['dev', 'tools']);
    expect(entry.url).toBe('https://example.com');
    expect(entry.tags).toContain('dev');
    expect(entry.id).toBeTruthy();
  });

  it('persists entry to disk', () => {
    addEntry('https://example.com', ['news']);
    const queue = loadQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].url).toBe('https://example.com');
  });

  it('appends multiple entries', () => {
    addEntry('https://a.com', []);
    addEntry('https://b.com', []);
    expect(loadQueue()).toHaveLength(2);
  });
});

describe('removeEntry', () => {
  it('removes an entry by id', () => {
    const e = addEntry('https://example.com', []);
    expect(removeEntry(e.id)).toBe(true);
    expect(loadQueue()).toHaveLength(0);
  });

  it('returns false for unknown id', () => {
    expect(removeEntry('nonexistent')).toBe(false);
  });
});

describe('filterByTag', () => {
  it('returns only entries matching the tag', () => {
    addEntry('https://a.com', ['work']);
    addEntry('https://b.com', ['personal']);
    addEntry('https://c.com', ['work', 'read-later']);
    const results = filterByTag('work');
    expect(results).toHaveLength(2);
    expect(results.every((e) => e.tags.includes('work'))).toBe(true);
  });
});
