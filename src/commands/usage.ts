import { Command } from "commander";
import { getWorldUsage } from "@wazoo/client";
import {
  configureClient,
  errorMessage,
  formatOutput,
  GlobalOptions,
} from "../client.js";

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
      } catch (err) {
        console.error("Failed to fetch usage:", errorMessage(err));
        process.exit(1);
      }
    });
}
