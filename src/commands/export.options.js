import { exportCommand } from './export.js';

export function collect(value, previous) {
  return previous ? previous.concat([value]) : [value];
}

export function registerExportCommand(program) {
  program
    .command('export')
    .description('Export queue entries to a file or stdout')
    .option(
      '-f, --format <format>',
      'Output format: json, text, markdown (default: json)',
      'json'
    )
    .option(
      '-o, --output <file>',
      'Write output to a file instead of stdout'
    )
    .option(
      '-t, --tag <tag>',
      'Filter by tag (can be used multiple times)',
      collect,
      []
    )
    .option(
      '-p, --pretty',
      'Pretty-print JSON output',
      false
    )
    .action(async (options) => {
      await exportCommand({
        format: options.format,
        output: options.output,
        tags: options.tag && options.tag.length ? options.tag : null,
        pretty: options.pretty,
      });
    });
}
