import { loadQueue } from '../storage.js';
import { formatEntry } from './list.js';

/**
 * Search entries by keyword in URL or tags
 * @param {string} keyword
 * @param {object} options
 */
export async function searchCommand(keyword, options = {}) {
  if (!keyword || keyword.trim() === '') {
    console.error('Error: search keyword is required');
    process.exit(1);
  }

  const queue = await loadQueue();

  if (queue.length === 0) {
    console.log('Queue is empty.');
    return;
  }

  const term = keyword.toLowerCase();
  const { tagsOnly = false, urlOnly = false } = options;

  const results = queue.filter((entry) => {
    const matchesUrl = !tagsOnly && entry.url.toLowerCase().includes(term);
    const matchesTags =
      !urlOnly &&
      Array.isArray(entry.tags) &&
      entry.tags.some((tag) => tag.toLowerCase().includes(term));
    return matchesUrl || matchesTags;
  });

  if (results.length === 0) {
    console.log(`No entries found matching "${keyword}".`);
    return;
  }

  console.log(`Found ${results.length} result(s) for "${keyword}":\n`);
  results.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${formatEntry(entry)}`);
  });
}
