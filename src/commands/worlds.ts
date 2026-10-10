import { Command } from "commander";
import { listWorlds, createWorld, getWorld } from "@wazoo/client";
import {
  configureClient,
  fetchWorldsData,
  formatOutput,
  GlobalOptions,
} from "../client.js";
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

export function registerWorldsCommand(program: Command) {
  const worlds = program
    .command("worlds")
    .description("Manage and query Wazoo agent memory worlds");

  worlds
    .command("list")
    .description("List all worlds owned by your account")
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await listWorlds();
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Failed to list worlds:", err.message || err);
        process.exit(1);
      }
    });

  worlds
    .command("get <worldId>")
    .description("Get details for a world by its server-minted ID")
    .action(async (worldId: string) => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await getWorld({ path: { worldId } });
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error(`Failed to get world '${worldId}':`, err.message || err);
        process.exit(1);
      }
    });

  worlds
    .command("create")
    .description("Create a world; the API returns its immutable w_<UUIDv4> ID")
    .requiredOption("-n, --name <displayName>", "World display name")
    .action(async (cmdOpts: { name: string }) => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await createWorld({
          body: {
            world: {
              displayName: cmdOpts.name,
            },
          },
        });
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Failed to create world:", err.message || err);
        process.exit(1);
      }
    });

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
        } catch (err: any) {
          console.error(
            `Failed to import data into '${worldId}':`,
            err.message || err,
          );
          process.exit(1);
        }
      },
    );

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
        } catch (err: any) {
          console.error(
            `Failed to search world '${worldId}':`,
            err.message || err,
          );
          process.exit(1);
        }
      },
    );

  worlds
    .command("sparql <worldId>")
    .description("Execute a SPARQL query on the world graph")
    .option("-q, --query <sparqlQuery>", "SPARQL query string")
    .option("-f, --file <filePath>", "Path to file containing SPARQL query")
    .action(
      async (worldId: string, cmdOpts: { query?: string; file?: string }) => {
        const opts = program.opts<GlobalOptions>();

        let sparqlQuery = cmdOpts.query;
        if (!sparqlQuery && cmdOpts.file) {
          sparqlQuery = await readFile(cmdOpts.file, "utf8");
        }

        if (!sparqlQuery) {
          console.error(
            "Error: Please provide a SPARQL query via --query or --file",
          );
          process.exit(1);
        }

        try {
          const result = await fetchWorldsData(
            `/worlds/${encodeURIComponent(worldId)}/sparql`,
            "POST",
            { query: sparqlQuery },
            opts,
          );
          formatOutput(result, opts.json);
        } catch (err: any) {
          console.error(
            `Failed to execute SPARQL query on '${worldId}':`,
            err.message || err,
          );
          process.exit(1);
        }
      },
    );

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
        } catch (err: any) {
          console.error(
            `Failed to export world '${worldId}':`,
            err.message || err,
          );
          process.exit(1);
        }
      },
    );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isQuadFilter(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const { include, exclude } = value as Record<string, unknown>;
  for (const block of [include, exclude]) {
    if (block === undefined) continue;
    if (typeof block !== "object" || block === null) return false;
    const { subjects, predicates, graphs } = block as Record<string, unknown>;
    for (const list of [subjects, predicates, graphs]) {
      if (list === undefined) continue;
      if (!isStringArray(list)) return false;
    }
  }
  return true;
}

/**
 * Renders search output in human-readable form: the search mode that actually
 * ran, plus each result's normalized score and scoreType. `--json` keeps the
 * raw contract response.
 */
function formatSearchOutput(data: unknown, jsonMode?: boolean) {
  if (jsonMode) {
    formatOutput(data, true);
    return;
  }

  const { mode, results } = (data ?? {}) as {
    mode?: string;
    results?: Array<{
      subject: string;
      predicate: string;
      content: string;
      graph?: string;
      score: number | null;
      scoreType?: string;
    }>;
  };

  console.log(`mode: ${mode ?? "unknown"}`);
  const rows = results ?? [];
  if (rows.length === 0) {
    console.log("no results");
    return;
  }

  for (const r of rows) {
    const score =
      r.score !== null && r.score !== undefined
        ? `${r.score.toFixed(4)} (${r.scoreType ?? "rrf"})`
        : "—";
    console.log(`  • ${r.subject}`);
    console.log(`    ${r.predicate}`);
    console.log(`    ${r.content ?? ""}  [score: ${score}]`);
  }
}
