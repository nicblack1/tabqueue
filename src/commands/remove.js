const { loadQueue, removeEntry } = require('../storage');

async function removeCommand(identifier, options = {}) {
  const queue = await loadQueue();

  if (queue.length === 0) {
    console.log('Queue is empty. Nothing to remove.');
    return;
  }

  let entry;
  let index;

  if (options.id) {
    index = queue.findIndex(e => e.id === identifier);
  } else {
    // Try to match by URL or partial URL
    index = queue.findIndex(e => e.url === identifier || e.url.includes(identifier));
  }

  if (index === -1) {
    console.error(`No entry found matching: ${identifier}`);
    process.exit(1);
  }

  entry = queue[index];

  await removeEntry(entry.id);

  console.log(`Removed: ${entry.url}`);
  if (entry.tags && entry.tags.length > 0) {
    console.log(`  Tags: ${entry.tags.join(', ')}`);
  }
}

module.exports = { removeCommand };
