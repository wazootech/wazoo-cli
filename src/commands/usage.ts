import { Command } from "commander";
import { getWorldUsage } from "@wazoo/client";
import { configureClient, formatOutput, GlobalOptions } from "../client.js";

export function registerUsageCommand(program: Command) {
  program
    .command("usage <worldId>")
    .description("View account/world usage metrics")
    .action(async (worldId: string) => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await getWorldUsage({ path: { worldId } });
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Failed to fetch usage:", err.message || err);
        process.exit(1);
      }
    });
}
