import { loadQueue, saveQueue } from '../storage.js';

export async function tagCommand(id, options) {
  const queue = await loadQueue();
  const entry = queue.find((e) => e.id === id);

  if (!entry) {
    console.error(`No entry found with id: ${id}`);
    process.exit(1);
  }

  if (options.add && options.add.length > 0) {
    const newTags = parseTags(options.add);
    const merged = Array.from(new Set([...(entry.tags || []), ...newTags]));
    entry.tags = merged;
    console.log(`Added tags [${newTags.join(', ')}] to entry ${id}`);
  }

  if (options.remove && options.remove.length > 0) {
    const removeTags = parseTags(options.remove);
    entry.tags = (entry.tags || []).filter((t) => !removeTags.includes(t));
    console.log(`Removed tags [${removeTags.join(', ')}] from entry ${id}`);
  }

  if (options.set && options.set.length > 0) {
    const setTags = parseTags(options.set);
    entry.tags = setTags;
    console.log(`Set tags for entry ${id} to [${setTags.join(', ')}]`);
  }

  if (!options.add && !options.remove && !options.set) {
    const tags = entry.tags && entry.tags.length > 0 ? entry.tags.join(', ') : '(none)';
    console.log(`Tags for entry ${id}: ${tags}`);
    return;
  }

  await saveQueue(queue);
}

export function parseTags(input) {
  if (Array.isArray(input)) {
    return input.flatMap((t) => t.split(',').map((s) => s.trim())).filter(Boolean);
  }
  return String(input).split(',').map((s) => s.trim()).filter(Boolean);
}
