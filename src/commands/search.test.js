import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCommand } from './search.js';
import * as storage from '../storage.js';

vi.mock('../storage.js');

const mockQueue = [
  { id: '1', url: 'https://github.com/topics/javascript', tags: ['dev', 'js'], addedAt: '2024-01-01' },
  { id: '2', url: 'https://news.ycombinator.com', tags: ['news', 'tech'], addedAt: '2024-01-02' },
  { id: '3', url: 'https://developer.mozilla.org', tags: ['dev', 'docs'], addedAt: '2024-01-03' },
];

beforeEach(() => {
  vi.clearAllMocks();
  storage.loadQueue.mockResolvedValue(mockQueue);
});

describe('searchCommand', () => {
  it('finds entries matching keyword in URL', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('github');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 result(s)'));
    spy.mockRestore();
  });

  it('finds entries matching keyword in tags', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('dev');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2 result(s)'));
    spy.mockRestore();
  });

  it('respects tagsOnly option', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('github', { tagsOnly: true });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No entries found'));
    spy.mockRestore();
  });

  it('respects urlOnly option', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('dev', { urlOnly: true });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 result(s)'));
    spy.mockRestore();
  });

  it('prints message when no results found', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('nonexistent');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No entries found'));
    spy.mockRestore();
  });

  it('exits with error on empty keyword', async () => {
    const spy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(searchCommand('')).rejects.toThrow('exit');
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
    errSpy.mockRestore();
  });

  it('handles empty queue', async () => {
    storage.loadQueue.mockResolvedValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await searchCommand('anything');
    expect(spy).toHaveBeenCalledWith('Queue is empty.');
    spy.mockRestore();
  });
});
