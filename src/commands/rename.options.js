import { renameTag } from './rename.js';

export function registerRenameCommand(program) {
  program
    .command('rename <oldTag> <newTag>')
    .description('Rename a tag across all entries')
    .option('--strict', 'Exit with error if tag not found', false)
    .action(async (oldTag, newTag, options) => {
      try {
        const { affectedCount } = await renameTag(oldTag, newTag, {
          strict: options.strict,
        });

        if (affectedCount === 0) {
          console.log(
            `No entries found with tag "${oldTag.trim().toLowerCase()}".`
          );
        } else {
          console.log(
            `Renamed tag "${oldTag.trim().toLowerCase()}" to "${
              newTag.trim().toLowerCase()
            }" across ${affectedCount} entr${
              affectedCount === 1 ? 'y' : 'ies'
            }.`
          );
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
