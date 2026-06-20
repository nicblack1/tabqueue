import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openUrls, openCommand } from './open.js';
import * as storage from '../storage.js';

vi.mock('child_process', () => ({
  exec: vi.fn((cmd, cb) => cb(null, { stdout: '', stderr: '' }))
}));

vi.mock('../storage.js', () => ({
  loadQueue: vi.fn(),
  removeEntry: vi.fn()
}));

const mockEntries = [
  { id: '1', url: 'https://example.com', tags: ['work'], addedAt: '2024-01-01' },
  { id: '2', url: 'https://foo.dev', tags: ['dev', 'work'], addedAt: '2024-01-02' },
  { id: '3', url: 'https://bar.io', tags: ['read'], addedAt: '2024-01-03' }
];

beforeEach(() => {
  vi.clearAllMocks();
  storage.loadQueue.mockResolvedValue([...mockEntries]);
});

describe('openCommand', () => {
  it('opens all entries when no filters given', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await openCommand({});
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('3'));
    consoleSpy.mockRestore();
  });

  it('filters entries by tags', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await openCommand({ tags: ['work'] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2'));
    consoleSpy.mockRestore();
  });

  it('respects limit option', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await openCommand({ limit: 1 });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('1'));
    consoleSpy.mockRestore();
  });

  it('removes entries after opening when remove flag is set', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await openCommand({ remove: true });
    expect(storage.removeEntry).toHaveBeenCalledTimes(3);
  });

  it('logs message when queue is empty', async () => {
    storage.loadQueue.mockResolvedValue([]);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await openCommand({});
    expect(consoleSpy).toHaveBeenCalledWith('Queue is empty.');
    consoleSpy.mockRestore();
  });
});
