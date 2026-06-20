const { filterByTags, formatEntry } = require('./list');

const mockEntries = [
  { url: 'https://example.com', tags: ['work', 'docs'], addedAt: '2024-01-15T10:00:00.000Z' },
  { url: 'https://github.com', tags: ['work', 'dev'], addedAt: '2024-01-16T11:00:00.000Z' },
  { url: 'https://reddit.com', tags: ['personal'], addedAt: '2024-01-17T12:00:00.000Z' },
  { url: 'https://news.ycombinator.com', tags: [], addedAt: '2024-01-18T13:00:00.000Z' },
];

describe('filterByTags', () => {
  test('returns all entries when no tags provided', () => {
    expect(filterByTags(mockEntries, [])).toHaveLength(4);
  });

  test('returns all entries when tags is undefined', () => {
    expect(filterByTags(mockEntries, undefined)).toHaveLength(4);
  });

  test('filters entries by a single tag', () => {
    const result = filterByTags(mockEntries, ['work']);
    expect(result).toHaveLength(2);
    expect(result.map(e => e.url)).toContain('https://example.com');
    expect(result.map(e => e.url)).toContain('https://github.com');
  });

  test('filters entries by multiple tags (AND logic)', () => {
    const result = filterByTags(mockEntries, ['work', 'docs']);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com');
  });

  test('returns empty array when no entries match', () => {
    const result = filterByTags(mockEntries, ['nonexistent']);
    expect(result).toHaveLength(0);
  });
});

describe('formatEntry', () => {
  test('formats entry with tags', () => {
    const output = formatEntry(mockEntries[0], 0);
    expect(output).toContain('https://example.com');
    expect(output).toContain('[work, docs]');
    expect(output).toContain('1.');
  });

  test('formats entry without tags', () => {
    const output = formatEntry(mockEntries[3], 3);
    expect(output).toContain('https://news.ycombinator.com');
    expect(output).not.toContain('[');
    expect(output).toContain('4.');
  });

  test('uses 1-based index', () => {
    const output = formatEntry(mockEntries[1], 1);
    expect(output).toMatch(/^\s+2\./);
  });
});
