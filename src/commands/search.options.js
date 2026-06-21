import { searchCommand } from './search.js';

/**
 * Register the search command with the CLI program
 * @param {import('commander').Command} program
 */
export function registerSearchCommand(program) {
  program
    .command('search <keyword>')
    .description('search entries by keyword in URL or tags')
    .option('--tags-only', 'only search within tags', false)
    .option('--url-only', 'only search within URLs', false)
    .action(async (keyword, options) => {
      await searchCommand(keyword, {
        tagsOnly: options.tagsOnly,
        urlOnly: options.urlOnly,
      });
    });
}
