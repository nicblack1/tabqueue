import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tagCommand, parseTags } from './tag.js';
import * as storage from '../storage.js';

vi.mock('../storage.js');

const mockEntry = (overrides = {}) => ({
  id: 'abc123',
  url: 'https://example.com',
  tags: ['news', 'tech'],
  addedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('parseTags', () => {
  it('splits comma-separated string', () => {
    expect(parseTags('foo,bar,baz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('handles array input', () => {
    expect(parseTags(['foo,bar', 'baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('trims whitespace', () => {
    expect(parseTags(' foo , bar ')).toEqual(['foo', 'bar']);
  });

  it('filters empty strings', () => {
    expect(parseTags(',,')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(parseTags([])).toEqual([]);
  });
});

describe('tagCommand', () => {
  it('logs tags when no options provided', async () => {
    storage.loadQueue.mockResolvedValue([mockEntry()]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await tagCommand('abc123', {});
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('news'));
    expect(storage.saveQueue).not.toHaveBeenCalled();
  });

  it('adds new tags without duplicates', async () => {
    const entry = mockEntry();
    storage.loadQueue.mockResolvedValue([entry]);
    storage.saveQueue.mockResolvedValue();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await tagCommand('abc123', { add: ['tech,design'] });
    expect(entry.tags).toContain('design');
    expect(entry.tags.filter((t) => t === 'tech').length).toBe(1);
    expect(storage.saveQueue).toHaveBeenCalled();
  });

  it('removes specified tags', async () => {
    const entry = mockEntry();
    storage.loadQueue.mockResolvedValue([entry]);
    storage.saveQueue.mockResolvedValue();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await tagCommand('abc123', { remove: ['news'] });
    expect(entry.tags).not.toContain('news');
    expect(entry.tags).toContain('tech');
  });

  it('does not save when removing a tag not present on entry', async () => {
    const entry = mockEntry();
    storage.loadQueue.mockResolvedValue([entry]);
    storage.saveQueue.mockResolvedValue();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await tagCommand('abc123', { remove: ['nonexistent'] });
    expect(entry.tags).toEqual(['news', 'tech']);
    expect(storage.saveQueue).not.toHaveBeenCalled();
  });

  it('exits with error for unknown id', async () => {
    storage.loadQueue.mockResolvedValue([mockEntry()]);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(tagCommand('unknown', {})).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
