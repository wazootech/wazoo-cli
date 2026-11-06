import { Command } from "commander";
import {
  errorMessage,
  fetchWorldsData,
  formatOutput,
  GlobalOptions,
} from "../../client.js";
import { readFile } from "node:fs/promises";

const IMPORT_TYPES_BY_EXTENSION: Record<string, string> = {
  ".ttl": "text/turtle",
  ".trig": "application/trig",
  ".nt": "application/n-triples",
  ".nq": "application/n-quads",
  ".n3": "text/n3",
  ".json": "application/json",
};

/**
 * importContentType picks the import content type: an explicit --type wins;
 * otherwise an RDF or JSON file extension decides; anything else is text
 * chunks. Without this, `--file data.ttl` imported each Turtle line as a
 * text chunk instead of triples.
 */
export function importContentType(
  explicitType: string | undefined,
  filePath: string | undefined,
): string {
  if (explicitType) return explicitType;
  const extension = filePath?.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  return (extension && IMPORT_TYPES_BY_EXTENSION[extension]) || "text/plain";
}

export function registerImportCommand(worlds: Command, program: Command) {
  worlds
    .command("import <worldId>")
    .description("Import raw text, file, or data into a world context")
    .option("-f, --file <filePath>", "Path to file to import")
    .option("-d, --data <text>", "Inline text content to import")
    .option(
      "-t, --type <contentType>",
      "Content type (default: from the file extension, e.g. .ttl -> text/turtle; otherwise text/plain)",
    )
    .action(
      async (
        worldId: string,
        cmdOpts: { file?: string; data?: string; type?: string },
      ) => {
        const opts = program.opts<GlobalOptions>();

        let content = cmdOpts.data;
        if (!content && cmdOpts.file) {
          content = await readFile(cmdOpts.file, "utf8");
        }

        if (!content) {
          console.error("Error: Please provide content via --data or --file");
          process.exit(1);
        }

        try {
          const result = await fetchWorldsData(
            `/worlds/${encodeURIComponent(worldId)}/import`,
            "POST",
            {
              contentType: importContentType(cmdOpts.type, cmdOpts.file),
              data: content,
            },
            opts,
          );
          formatOutput(result, opts.json);
        } catch (err) {
          console.error(
            `Failed to import data into '${worldId}':`,
            errorMessage(err),
          );
          process.exit(1);
        }
      },
    );
}
