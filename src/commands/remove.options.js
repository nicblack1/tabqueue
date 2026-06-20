const { removeCommand } = require('./remove');
const { clearCommand } = require('./clear');

function registerRemoveCommand(program) {
  program
    .command('remove <identifier>')
    .alias('rm')
    .description('Remove an entry from the queue by URL or ID')
    .option('--id', 'Treat identifier as an entry ID instead of URL')
    .action(async (identifier, options) => {
      try {
        await removeCommand(identifier, options);
      } catch (err) {
        console.error('Error removing entry:', err.message);
        process.exit(1);
      }
    });
}

function registerClearCommand(program) {
  program
    .command('clear')
    .description('Remove all entries from the queue')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (options) => {
      try {
        await clearCommand(options);
      } catch (err) {
        console.error('Error clearing queue:', err.message);
        process.exit(1);
      }
    });
}

module.exports = { registerRemoveCommand, registerClearCommand };
