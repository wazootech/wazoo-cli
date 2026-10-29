import { Command } from "commander";
import {
  errorMessage,
  fetchWorldsData,
  formatOutput,
  GlobalOptions,
} from "../../client.js";
import { readFile } from "node:fs/promises";

export function registerSparqlCommand(worlds: Command, program: Command) {
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
        } catch (err) {
          console.error(
            `Failed to execute SPARQL query on '${worldId}':`,
            errorMessage(err),
          );
          process.exit(1);
        }
      },
    );
}
