import { loadQueue, removeEntry } from '../storage.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function getOpenCommand() {
  switch (process.platform) {
    case 'darwin': return 'open';
    case 'win32': return 'start';
    default: return 'xdg-open';
  }
}

export async function openUrls(urls) {
  const cmd = getOpenCommand();
  const results = await Promise.allSettled(
    urls.map(url => execAsync(`${cmd} "${url}"`)
  ));
  const failed = results
    .map((r, i) => r.status === 'rejected' ? urls[i] : null)
    .filter(Boolean);
  return { opened: urls.length - failed.length, failed };
}

export async function openCommand(options = {}) {
  const { tags, limit, remove } = options;
  const queue = await loadQueue();

  if (queue.length === 0) {
    console.log('Queue is empty.');
    return;
  }

  let entries = queue;

  if (tags && tags.length > 0) {
    entries = entries.filter(e =>
      tags.every(tag => e.tags.includes(tag))
    );
  }

  if (entries.length === 0) {
    console.log('No entries match the given tags.');
    return;
  }

  if (limit && limit > 0) {
    entries = entries.slice(0, limit);
  }

  const urls = entries.map(e => e.url);
  console.log(`Opening ${urls.length} URL(s)...`);

  const { opened, failed } = await openUrls(urls);
  console.log(`Opened: ${opened}`);

  if (failed.length > 0) {
    console.warn(`Failed to open: ${failed.join(', ')}`);
  }

  if (remove) {
    const ids = entries.map(e => e.id);
    for (const id of ids) {
      await removeEntry(id);
    }
    console.log(`Removed ${ids.length} entry(s) from queue.`);
  }
}
