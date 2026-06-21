import { loadQueue, saveQueue } from '../storage.js';

/**
 * Find duplicate entries by URL.
 * Returns a map of url -> array of entries.
 */
export function findDuplicates(entries) {
  const seen = {};
  for (const entry of entries) {
    const url = entry.url.toLowerCase();
    if (!seen[url]) seen[url] = [];
    seen[url].push(entry);
  }
  return Object.fromEntries(
    Object.entries(seen).filter(([, group]) => group.length > 1)
  );
}

/**
 * Deduplicate entries: keep the oldest (first added) entry for each URL,
 * merging tags from all duplicates.
 */
export function deduplicateEntries(entries) {
  const seen = {};
  const result = [];

  for (const entry of entries) {
    const key = entry.url.toLowerCase();
    if (!seen[key]) {
      seen[key] = { ...entry, tags: [...(entry.tags || [])] };
      result.push(seen[key]);
    } else {
      // Merge tags from duplicate into the kept entry
      for (const tag of entry.tags || []) {
        if (!seen[key].tags.includes(tag)) {
          seen[key].tags.push(tag);
        }
      }
    }
  }

  return result;
}

export async function dedupeCommand(options = {}) {
  const entries = await loadQueue();

  if (entries.length === 0) {
    console.log('Queue is empty.');
    return;
  }

  const duplicates = findDuplicates(entries);
  const dupCount = Object.keys(duplicates).length;

  if (dupCount === 0) {
    console.log('No duplicates found.');
    return;
  }

  const before = entries.length;
  const deduped = deduplicateEntries(entries);
  const removed = before - deduped.length;

  if (options.dryRun) {
    console.log(`Found ${dupCount} duplicate URL(s), would remove ${removed} entr${removed === 1 ? 'y' : 'ies'}.`);
    for (const [url, group] of Object.entries(duplicates)) {
      console.log(`  ${url} — ${group.length} copies`);
    }
    return;
  }

  await saveQueue(deduped);
  console.log(`Removed ${removed} duplicate entr${removed === 1 ? 'y' : 'ies'}. Queue now has ${deduped.length} item(s).`);
}
