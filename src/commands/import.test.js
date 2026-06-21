import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseImportFile, importCommand } from './import.js';

vi.mock('../storage.js', () => ({
  loadQueue: vi.fn(),
  saveQueue: vi.fn(),
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}));

const sampleJson = JSON.stringify([
  { url: 'https://example.com', tags: ['dev'] },
  { url: 'https://openai.com', tags: [] },
]);

const sampleText = `https://example.com [dev, tools]
https://openai.com`;

describe('parseImportFile', () => {
  it('parses valid JSON array', () => {
    const result = parseImportFile(sampleJson, 'json');
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com');
  });

  it('throws if JSON is not an array', () => {
    expect(() => parseImportFile('{"url":"x"}', 'json')).toThrow();
  });

  it('parses text format with tags', () => {
    const result = parseImportFile(sampleText, 'text');
    expect(result).toHaveLength(2);
    expect(result[0].tags).toContain('dev');
    expect(result[0].tags).toContain('tools');
  });

  it('parses text format without tags', () => {
    const result = parseImportFile('https://example.com', 'text');
    expect(result[0].tags).toEqual([]);
  });

  it('throws on unsupported format', () => {
    expect(() => parseImportFile('', 'csv')).toThrow('Unsupported format');
  });

  it('skips empty lines in text format', () => {
    const result = parseImportFile('https://a.com\n\nhttps://b.com', 'text');
    expect(result).toHaveLength(2);
  });
});

describe('importCommand', () => {
  const { loadQueue, saveQueue } = await import('../storage.js');
  const { readFileSync } = await import('fs');

  beforeEach(() => {
    vi.clearAllMocks();
    loadQueue.mockResolvedValue([]);
    saveQueue.mockResolvedValue();
    readFileSync.mockReturnValue(sampleJson);
  });

  it('imports entries from json file', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await importCommand('queue.json', { format: 'json' });
    expect(saveQueue).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toMatch(/Imported 2/);
    spy.mockRestore();
  });

  it('skips duplicates when flag is set', async () => {
    loadQueue.mockResolvedValue([{ url: 'https://example.com', tags: [] }]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await importCommand('queue.json', { format: 'json', skipDuplicates: true });
    const saved = saveQueue.mock.calls[0][0];
    expect(saved.filter(e => e.url === 'https://example.com')).toHaveLength(1);
    spy.mockRestore();
  });
});
