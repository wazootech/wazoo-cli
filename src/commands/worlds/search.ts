import { Command } from "commander";
import { errorMessage, fetchWorldsData, GlobalOptions } from "../../client.js";
import { isQuadFilter } from "./quad-filter.js";
import { formatSearchOutput } from "./search-output.js";

export function registerSearchCommand(worlds: Command, program: Command) {
  worlds
    .command("search <worldId>")
    .description(
      "Search world memory (keyword, vector, or hybrid; automatic fallback)",
    )
    .requiredOption("-q, --query <text>", "Search query string")
    .option(
      "-l, --limit <number>",
      "Limit maximum results returned (1–100)",
      "5",
    )
    .option(
      "-m, --min-score <number>",
      "Minimum normalized score floor (0–1, default: world default)",
    )
    .option(
      "--filter <json>",
      `Quad filter as JSON, e.g. {"include":{"subjects":["urn:a"]},"exclude":{"graphs":["urn:private"]}}`,
    )
    .action(
      async (
        worldId: string,
        cmdOpts: {
          query: string;
          limit: string;
          minScore?: string;
          filter?: string;
        },
      ) => {
        const opts = program.opts<GlobalOptions>();

        let minScore: number | undefined;
        if (cmdOpts.minScore !== undefined) {
          minScore = parseFloat(cmdOpts.minScore);
          if (Number.isNaN(minScore) || minScore < 0 || minScore > 1) {
            console.error(
              "Error: --min-score must be a number between 0 and 1",
            );
            process.exit(1);
          }
        }

        let filter: unknown;
        if (cmdOpts.filter !== undefined) {
          try {
            filter = JSON.parse(cmdOpts.filter);
          } catch {
            console.error("Error: --filter must be valid JSON");
            process.exit(1);
          }
          if (!isQuadFilter(filter)) {
            console.error(
              "Error: --filter must be { include?, exclude? } with optional subjects/predicates/graphs string arrays",
            );
            process.exit(1);
          }
        }

        try {
          const result = await fetchWorldsData(
            `/worlds/${encodeURIComponent(worldId)}/search`,
            "POST",
            {
              query: cmdOpts.query,
              limit: parseInt(cmdOpts.limit, 10),
              ...(minScore !== undefined && { minScore }),
              ...(filter !== undefined && { filter }),
            },
            opts,
          );
          formatSearchOutput(result, opts.json);
        } catch (err) {
          console.error(
            `Failed to search world '${worldId}':`,
            errorMessage(err),
          );
          process.exit(1);
        }
      },
    );
}
