import { Command } from "commander";
import { listWorlds, createWorld, getWorld } from "@wazoo/client";
import { configureClient, fetchWorldsData, formatOutput, GlobalOptions } from "../client.js";
import { readFile } from "node:fs/promises";

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
    .description("Get details for a specific world by worldId")
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
    .description("Create a new world graph")
    .requiredOption("-w, --world-id <worldId>", "World resource ID")
    .requiredOption("-n, --name <displayName>", "World display name")
    .action(async (cmdOpts: { worldId: string; name: string }) => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await createWorld({
          body: {
            worldId: cmdOpts.worldId,
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
    .option("-t, --type <contentType>", "Content type (default: text/plain)", "text/plain")
    .action(async (worldId: string, cmdOpts: { file?: string; data?: string; type: string }) => {
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
          `/worlds/${worldId}/import`,
          "POST",
          { contentType: cmdOpts.type, data: content },
          opts,
        );
        formatOutput(result, opts.json);
      } catch (err: any) {
        console.error(`Failed to import data into '${worldId}':`, err.message || err);
        process.exit(1);
      }
    });

  worlds
    .command("search <worldId>")
    .description("Hybrid vector + graph search across world memory context")
    .requiredOption("-q, --query <text>", "Search query string")
    .option("-l, --limit <number>", "Limit maximum results returned", "5")
    .action(async (worldId: string, cmdOpts: { query: string; limit: string }) => {
      const opts = program.opts<GlobalOptions>();

      try {
        const result = await fetchWorldsData(
          `/worlds/${worldId}/search`,
          "POST",
          { query: cmdOpts.query, limit: parseInt(cmdOpts.limit, 10) },
          opts,
        );
        formatOutput(result, opts.json);
      } catch (err: any) {
        console.error(`Failed to search world '${worldId}':`, err.message || err);
        process.exit(1);
      }
    });

  worlds
    .command("sparql <worldId>")
    .description("Execute a SPARQL query on the world graph")
    .option("-q, --query <sparqlQuery>", "SPARQL query string")
    .option("-f, --file <filePath>", "Path to file containing SPARQL query")
    .action(async (worldId: string, cmdOpts: { query?: string; file?: string }) => {
      const opts = program.opts<GlobalOptions>();

      let sparqlQuery = cmdOpts.query;
      if (!sparqlQuery && cmdOpts.file) {
        sparqlQuery = await readFile(cmdOpts.file, "utf8");
      }

      if (!sparqlQuery) {
        console.error("Error: Please provide a SPARQL query via --query or --file");
        process.exit(1);
      }

      try {
        const result = await fetchWorldsData(
          `/worlds/${worldId}/sparql`,
          "POST",
          { query: sparqlQuery },
          opts,
        );
        formatOutput(result, opts.json);
      } catch (err: any) {
        console.error(`Failed to execute SPARQL query on '${worldId}':`, err.message || err);
        process.exit(1);
      }
    });

  worlds
    .command("export <worldId>")
    .description("Export world graph quads/triples")
    .option("--format <fmt>", "Export format (default: application/json)", "application/json")
    .option("-l, --limit <number>", "Limit maximum quads exported", "100")
    .action(async (worldId: string, cmdOpts: { format: string; limit: string }) => {
      const opts = program.opts<GlobalOptions>();

      try {
        const queryParams = new URLSearchParams({
          format: cmdOpts.format,
          limit: cmdOpts.limit,
        });
        const result = await fetchWorldsData(
          `/worlds/${worldId}/export?${queryParams.toString()}`,
          "GET",
          undefined,
          opts,
        );
        formatOutput(result, opts.json);
      } catch (err: any) {
        console.error(`Failed to export world '${worldId}':`, err.message || err);
        process.exit(1);
      }
    });
}
