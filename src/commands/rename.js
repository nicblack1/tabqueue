import { loadQueue, saveQueue } from '../storage.js';

export async function renameTag(oldTag, newTag, options = {}) {
  const queue = await loadQueue();

  if (!oldTag || typeof oldTag !== 'string' || oldTag.trim() === '') {
    throw new Error('Old tag name must be a non-empty string');
  }

  if (!newTag || typeof newTag !== 'string' || newTag.trim() === '') {
    throw new Error('New tag name must be a non-empty string');
  }

  const normalizedOld = oldTag.trim().toLowerCase();
  const normalizedNew = newTag.trim().toLowerCase();

  if (normalizedOld === normalizedNew) {
    throw new Error('Old and new tag names must be different');
  }

  let affectedCount = 0;

  const updated = queue.map((entry) => {
    const tags = entry.tags || [];
    if (tags.includes(normalizedOld)) {
      affectedCount++;
      const newTags = tags
        .filter((t) => t !== normalizedOld)
        .concat(tags.includes(normalizedNew) ? [] : [normalizedNew])
        .sort();
      return { ...entry, tags: newTags };
    }
    return entry;
  });

  if (affectedCount === 0) {
    if (options.strict) {
      throw new Error(`Tag "${normalizedOld}" not found in any entry`);
    }
    return { affectedCount: 0, queue: updated };
  }

  await saveQueue(updated);
  return { affectedCount, queue: updated };
}
