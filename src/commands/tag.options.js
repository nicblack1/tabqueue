import { tagCommand } from './tag.js';

export function registerTagCommand(program) {
  program
    .command('tag <id>')
    .description('View or modify tags for a queue entry')
    .option(
      '-a, --add <tags>',
      'Add comma-separated tags to the entry',
      collect,
      []
    )
    .option(
      '-r, --remove <tags>',
      'Remove comma-separated tags from the entry',
      collect,
      []
    )
    .option(
      '-s, --set <tags>',
      'Replace all tags with the given comma-separated list',
      collect,
      []
    )
    .action(async (id, options) => {
      await tagCommand(id, {
        add: options.add.length > 0 ? options.add : null,
        remove: options.remove.length > 0 ? options.remove : null,
        set: options.set.length > 0 ? options.set : null,
      });
    });
}

function collect(val, prev) {
  return prev.concat([val]);
}
