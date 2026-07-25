import { Command } from "commander";
import { listWorlds, createWorld, getWorld } from "@wazoo/client";
import { configureClient, formatOutput, GlobalOptions } from "../client.js";

export function registerWorldsCommand(program: Command) {
  const worlds = program
    .command("worlds")
    .description("Manage Wazoo agent memory worlds");

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
}
