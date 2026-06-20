const { loadQueue } = require('../storage');

function formatEntry(entry, index) {
  const tags = entry.tags && entry.tags.length > 0
    ? ` [${entry.tags.join(', ')}]`
    : '';
  const date = new Date(entry.addedAt).toLocaleDateString();
  return `  ${index + 1}. ${entry.url}${tags} (added ${date})`;
}

function filterByTags(entries, tags) {
  if (!tags || tags.length === 0) return entries;
  return entries.filter(entry =>
    tags.every(tag => entry.tags && entry.tags.includes(tag))
  );
}

async function listCommand(options = {}) {
  const queue = await loadQueue();

  if (queue.length === 0) {
    console.log('Queue is empty. Add some URLs with: tabqueue add <url>');
    return;
  }

  const filterTags = options.tags
    ? options.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const entries = filterByTags(queue, filterTags);

  if (entries.length === 0) {
    const tagList = filterTags.join(', ');
    console.log(`No entries found with tag(s): ${tagList}`);
    return;
  }

  const header = filterTags.length > 0
    ? `Queue (filtered by: ${filterTags.join(', ')}) — ${entries.length} item(s):`
    : `Queue — ${entries.length} item(s):`;

  console.log(header);
  entries.forEach((entry, i) => {
    console.log(formatEntry(entry, i));
  });
}

module.exports = { listCommand, filterByTags, formatEntry };
