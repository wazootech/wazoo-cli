import { Command } from "commander";
import {
  errorMessage,
  fetchWorldsData,
  formatOutput,
  GlobalOptions,
} from "../../client.js";

export function registerExportCommand(worlds: Command, program: Command) {
  worlds
    .command("export <worldId>")
    .description("Export world graph quads/triples")
    .option(
      "--format <fmt>",
      "Export format (default: application/json)",
      "application/json",
    )
    .option("-l, --limit <number>", "Limit maximum quads exported", "100")
    .action(
      async (worldId: string, cmdOpts: { format: string; limit: string }) => {
        const opts = program.opts<GlobalOptions>();

        try {
          const queryParams = new URLSearchParams({
            format: cmdOpts.format,
            limit: cmdOpts.limit,
          });
          const result = await fetchWorldsData(
            `/worlds/${encodeURIComponent(worldId)}/export?${queryParams.toString()}`,
            "GET",
            undefined,
            opts,
          );
          formatOutput(result, opts.json);
        } catch (err) {
          console.error(
            `Failed to export world '${worldId}':`,
            errorMessage(err),
          );
          process.exit(1);
        }
      },
    );
}
