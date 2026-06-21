import { statsCommand } from './stats.js';

export function registerStatsCommand(program) {
  program
    .command('stats')
    .description('show statistics about the current queue')
    .action(async () => {
      try {
        await statsCommand();
      } catch (err) {
        console.error('Error computing stats:', err.message);
        process.exit(1);
      }
    });
}
