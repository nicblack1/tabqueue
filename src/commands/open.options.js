/**
 * CLI option definitions for the `open` command.
 * Used by the main CLI entry point to register the command.
 */
export const openCommandDef = {
  command: 'open',
  describe: 'Open URLs from the queue in the default browser',
  builder: (yargs) => {
    return yargs
      .option('tags', {
        alias: 't',
        type: 'array',
        description: 'Only open entries matching ALL given tags',
        default: []
      })
      .option('limit', {
        alias: 'l',
        type: 'number',
        description: 'Maximum number of URLs to open',
        default: 0
      })
      .option('remove', {
        alias: 'r',
        type: 'boolean',
        description: 'Remove opened entries from the queue',
        default: false
      })
      .example('$0 open', 'Open all queued URLs')
      .example('$0 open --tags work dev', 'Open URLs tagged with both work and dev')
      .example('$0 open --limit 5 --remove', 'Open next 5 URLs and remove them');
  },
  handler: async (argv) => {
    const { openCommand } = await import('./open.js');
    await openCommand({
      tags: argv.tags,
      limit: argv.limit,
      remove: argv.remove
    });
  }
};
