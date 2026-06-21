import { loadQueue } from '../storage.js';
import { filterByTags } from './list.js';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export function exportToJson(entries, pretty = false) {
  return pretty
    ? JSON.stringify(entries, null, 2)
    : JSON.stringify(entries);
}

export function exportToText(entries) {
  return entries.map(e => {
    const tags = e.tags && e.tags.length ? ` [${e.tags.join(', ')}]` : '';
    return `${e.url}${tags}`;
  }).join('\n');
}

export function exportToMarkdown(entries) {
  const lines = ['# Tab Queue Export', ''];
  entries.forEach(e => {
    const tags = e.tags && e.tags.length ? ` — *${e.tags.join(', ')}*` : '';
    lines.push(`- [${e.url}](${e.url})${tags}`);
  });
  return lines.join('\n');
}

export async function exportCommand(options) {
  const queue = await loadQueue();
  const filtered = options.tags ? filterByTags(queue, options.tags) : queue;

  if (filtered.length === 0) {
    console.log('No entries to export.');
    return;
  }

  let output;
  const format = options.format || 'json';

  if (format === 'json') {
    output = exportToJson(filtered, options.pretty);
  } else if (format === 'text') {
    output = exportToText(filtered);
  } else if (format === 'markdown') {
    output = exportToMarkdown(filtered);
  } else {
    console.error(`Unknown format: ${format}. Use json, text, or markdown.`);
    process.exit(1);
  }

  if (options.output) {
    const filePath = resolve(process.cwd(), options.output);
    writeFileSync(filePath, output, 'utf-8');
    console.log(`Exported ${filtered.length} entries to ${filePath}`);
  } else {
    console.log(output);
  }
}
