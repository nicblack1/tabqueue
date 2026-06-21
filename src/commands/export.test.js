import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToJson, exportToMarkdown, exportToText, exportCommand } from './export.js';

vi.mock('../storage.js', () => ({
  loadQueue: vi.fn(),
}));

vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
}));

const mockEntries = [
  { url: 'https://example.com', tags: ['dev', 'tools'], addedAt: '2024-01-01' },
  { url: 'https://openai.com', tags: [], addedAt: '2024-01-02' },
];

describe('exportToJson', () => {
  it('returns compact JSON by default', () => {
    const result = exportToJson(mockEntries);
    expect(result).toBe(JSON.stringify(mockEntries));
  });

  it('returns pretty JSON when flag is set', () => {
    const result = exportToJson(mockEntries, true);
    expect(result).toContain('\n');
    expect(JSON.parse(result)).toEqual(mockEntries);
  });
});

describe('exportToText', () => {
  it('formats entries with tags', () => {
    const result = exportToText(mockEntries);
    expect(result).toContain('https://example.com [dev, tools]');
    expect(result).toContain('https://openai.com');
  });

  it('omits tag bracket for entries without tags', () => {
    const result = exportToText([mockEntries[1]]);
    expect(result).not.toContain('[');
  });
});

describe('exportToMarkdown', () => {
  it('includes markdown heading', () => {
    const result = exportToMarkdown(mockEntries);
    expect(result).toContain('# Tab Queue Export');
  });

  it('formats entries as markdown links', () => {
    const result = exportToMarkdown(mockEntries);
    expect(result).toContain('[https://example.com](https://example.com)');
  });

  it('includes tags in italics', () => {
    const result = exportToMarkdown(mockEntries);
    expect(result).toContain('*dev, tools*');
  });
});

describe('exportCommand', () => {
  const { loadQueue } = await import('../storage.js');
  const { writeFileSync } = await import('fs');

  beforeEach(() => {
    vi.clearAllMocks();
    loadQueue.mockResolvedValue(mockEntries);
  });

  it('logs message when queue is empty', async () => {
    loadQueue.mockResolvedValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await exportCommand({ format: 'json' });
    expect(spy).toHaveBeenCalledWith('No entries to export.');
    spy.mockRestore();
  });

  it('prints json to stdout by default', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await exportCommand({ format: 'json' });
    expect(spy).toHaveBeenCalledWith(JSON.stringify(mockEntries));
    spy.mockRestore();
  });

  it('writes to file when output option is set', async () => {
    await exportCommand({ format: 'text', output: 'out.txt' });
    expect(writeFileSync).toHaveBeenCalled();
  });
});
