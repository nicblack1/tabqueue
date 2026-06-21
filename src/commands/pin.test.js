import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pinCommand, getPinnedEntries } from './pin.js';
import * as storage from '../storage.js';

vi.mock('../storage.js');

const makeQueue = (entries) => ({ entries });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('pinCommand', () => {
  it('pins an entry by id', async () => {
    const queue = makeQueue([{ id: 'abc', url: 'https://example.com', tags: [] }]);
    storage.loadQueue.mockResolvedValue(queue);
    storage.saveQueue.mockResolvedValue();

    await pinCommand(['abc'], {});

    expect(storage.saveQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([
          expect.objectContaining({ id: 'abc', pinned: true }),
        ]),
      })
    );
  });

  it('skips already pinned entries', async () => {
    const queue = makeQueue([{ id: 'abc', url: 'https://example.com', pinned: true }]);
    storage.loadQueue.mockResolvedValue(queue);

    await pinCommand(['abc'], {});

    expect(storage.saveQueue).not.toHaveBeenCalled();
  });

  it('unpins an entry when --unpin flag is set', async () => {
    const queue = makeQueue([{ id: 'abc', url: 'https://example.com', pinned: true }]);
    storage.loadQueue.mockResolvedValue(queue);
    storage.saveQueue.mockResolvedValue();

    await pinCommand(['abc'], { unpin: true });

    const saved = storage.saveQueue.mock.calls[0][0];
    expect(saved.entries[0].pinned).toBeUndefined();
  });

  it('warns when id is not found', async () => {
    const queue = makeQueue([{ id: 'abc', url: 'https://example.com' }]);
    storage.loadQueue.mockResolvedValue(queue);

    await pinCommand(['nonexistent'], {});

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent'));
  });

  it('handles empty queue gracefully', async () => {
    storage.loadQueue.mockResolvedValue(makeQueue([]));

    await pinCommand(['abc'], {});

    expect(storage.saveQueue).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Queue is empty.');
  });
});

describe('getPinnedEntries', () => {
  it('returns only pinned entries', () => {
    const queue = makeQueue([
      { id: '1', url: 'https://a.com', pinned: true },
      { id: '2', url: 'https://b.com' },
      { id: '3', url: 'https://c.com', pinned: true },
    ]);
    const result = getPinnedEntries(queue);
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.pinned)).toBe(true);
  });

  it('returns empty array when no entries are pinned', () => {
    const queue = makeQueue([{ id: '1', url: 'https://a.com' }]);
    expect(getPinnedEntries(queue)).toHaveLength(0);
  });
});
