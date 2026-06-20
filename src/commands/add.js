import { addEntry } from '../storage.js';

/**
 * Handler for `tabqueue add <url> [--tags tag1,tag2]`
 */
export function addCommand(url, options = {}) {
  if (!url || !isValidUrl(url)) {
    console.error(`Error: "${url}" is not a valid URL.`);
    process.exit(1);
  }

  const tags = parseTags(options.tags);
  const entry = addEntry(url, tags);

  console.log(`Added entry ${entry.id}`);
  console.log(`  URL : ${entry.url}`);
  if (tags.length > 0) {
    console.log(`  Tags: ${tags.join(', ')}`);
  }
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseTags(tagsInput) {
  if (!tagsInput) return [];
  return tagsInput
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}
