import { readFileSync } from 'fs';
import { resolve } from 'path';
import { loadQueue, saveQueue } from '../storage.js';
import { isValidUrl } from './add.js';

export function parseImportFile(content, format) {
  if (format === 'json') {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error('JSON must be an array of entries');
    return data;
  }

  if (format === 'text') {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const tagMatch = line.match(/^(.+?)\s+\[(.+)\]$/);
        if (tagMatch) {
          return { url: tagMatch[1].trim(), tags: tagMatch[2].split(',').map(t => t.trim()) };
        }
        return { url: line, tags: [] };
      });
  }

  throw new Error(`Unsupported format: ${format}`);
}

export async function importCommand(filePath, options) {
  const absPath = resolve(process.cwd(), filePath);
  let content;

  try {
    content = readFileSync(absPath, 'utf-8');
  } catch {
    console.error(`Could not read file: ${absPath}`);
    process.exit(1);
  }

  const format = options.format || 'json';
  let entries;

  try {
    entries = parseImportFile(content, format);
  } catch (err) {
    console.error(`Failed to parse file: ${err.message}`);
    process.exit(1);
  }

  const valid = entries.filter(e => e.url && isValidUrl(e.url));
  const skipped = entries.length - valid.length;

  const queue = await loadQueue();
  const existingUrls = new Set(queue.map(e => e.url));

  const toAdd = options.skipDuplicates
    ? valid.filter(e => !existingUrls.has(e.url))
    : valid;

  const now = new Date().toISOString();
  const newEntries = toAdd.map(e => ({
    url: e.url,
    tags: Array.isArray(e.tags) ? e.tags : [],
    addedAt: e.addedAt || now,
  }));

  await saveQueue([...queue, ...newEntries]);
  console.log(`Imported ${newEntries.length} entries.${skipped ? ` Skipped ${skipped} invalid.` : ''}${
    options.skipDuplicates && (valid.length - newEntries.length) > 0
      ? ` Skipped ${valid.length - newEntries.length} duplicates.`
      : ''
  }`);
}
