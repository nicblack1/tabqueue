import { loadQueue } from '../storage.js';

export function computeStats(entries) {
  const total = entries.length;

  if (total === 0) {
    return { total: 0, tagCounts: {}, topTags: [], avgTagsPerEntry: 0, untagged: 0 };
  }

  const tagCounts = {};
  let totalTags = 0;
  let untagged = 0;

  for (const entry of entries) {
    const tags = entry.tags ?? [];
    if (tags.length === 0) {
      untagged++;
    } else {
      totalTags += tags.length;
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const avgTagsPerEntry = total > 0 ? +(totalTags / total).toFixed(2) : 0;

  return { total, tagCounts, topTags, avgTagsPerEntry, untagged };
}

export async function statsCommand() {
  const queue = await loadQueue();
  const stats = computeStats(queue);

  if (stats.total === 0) {
    console.log('Queue is empty — nothing to report.');
    return;
  }

  console.log(`\n📊 Queue Stats`);
  console.log(`  Total entries : ${stats.total}`);
  console.log(`  Untagged      : ${stats.untagged}`);
  console.log(`  Avg tags/entry: ${stats.avgTagsPerEntry}`);

  if (stats.topTags.length > 0) {
    console.log(`\n  Top tags:`);
    for (const { tag, count } of stats.topTags) {
      console.log(`    #${tag.padEnd(20)} ${count}`);
    }
  }

  console.log('');
}
