import { Command } from "commander";
import { listWorlds, createWorld, getWorld } from "@wazoo/client";
import {
  configureClient,
  errorMessage,
  formatOutput,
  GlobalOptions,
} from "../client.js";
import { registerImportCommand } from "./worlds/import.js";
import { registerSearchCommand } from "./worlds/search.js";
import { registerSparqlCommand } from "./worlds/sparql.js";
import { registerExportCommand } from "./worlds/export.js";

export { importContentType } from "./worlds/import.js";

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
      } catch (err) {
        console.error("Failed to list worlds:", errorMessage(err));
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
      } catch (err) {
        console.error(`Failed to get world '${worldId}':`, errorMessage(err));
        process.exit(1);
      }
    });

  worlds
    .command("create")
    .description("Create a world; the API returns its immutable w_<ULID> ID")
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
      } catch (err) {
        console.error("Failed to create world:", errorMessage(err));
        process.exit(1);
      }
    });

  registerImportCommand(worlds, program);
  registerSearchCommand(worlds, program);
  registerSparqlCommand(worlds, program);
  registerExportCommand(worlds, program);
}
