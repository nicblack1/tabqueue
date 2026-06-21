import { loadQueue, saveQueue } from '../storage.js';

export async function pinCommand(ids, options) {
  const queue = await loadQueue();

  if (!queue.entries || queue.entries.length === 0) {
    console.log('Queue is empty.');
    return;
  }

  const { unpin = false } = options;
  const targetIds = ids.map((id) => id.trim());
  const notFound = [];
  let changed = 0;

  queue.entries = queue.entries.map((entry) => {
    if (!targetIds.includes(entry.id)) return entry;

    if (unpin) {
      if (!entry.pinned) {
        console.log(`Entry ${entry.id} is not pinned, skipping.`);
        return entry;
      }
      const { pinned, ...rest } = entry;
      changed++;
      console.log(`Unpinned: ${entry.url}`);
      return rest;
    }

    if (entry.pinned) {
      console.log(`Entry ${entry.id} is already pinned, skipping.`);
      return entry;
    }

    changed++;
    console.log(`Pinned: ${entry.url}`);
    return { ...entry, pinned: true };
  });

  targetIds.forEach((id) => {
    const found = queue.entries.find((e) => e.id === id);
    if (!found) notFound.push(id);
  });

  if (notFound.length > 0) {
    console.warn(`Not found: ${notFound.join(', ')}`);
  }

  if (changed > 0) {
    await saveQueue(queue);
    console.log(`\n${changed} entry/entries ${unpin ? 'unpinned' : 'pinned'}.`);
  }
}

export function getPinnedEntries(queue) {
  return (queue.entries || []).filter((e) => e.pinned === true);
}
