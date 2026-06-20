const { loadQueue, saveQueue } = require('../storage');
const readline = require('readline');

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function clearCommand(options = {}) {
  const queue = await loadQueue();

  if (queue.length === 0) {
    console.log('Queue is already empty.');
    return;
  }

  if (!options.force) {
    const answer = await confirm(`Clear all ${queue.length} entries? [y/N] `);
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Aborted.');
      return;
    }
  }

  await saveQueue([]);
  console.log(`Cleared ${queue.length} entr${queue.length === 1 ? 'y' : 'ies'} from the queue.`);
}

module.exports = { clearCommand };
