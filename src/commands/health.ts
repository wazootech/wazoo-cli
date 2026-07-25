import { Command } from "commander";
import { getHealth } from "@wazoo/client";
import { configureClient, formatOutput, GlobalOptions } from "../client.js";

export function registerHealthCommand(program: Command) {
  program
    .command("health")
    .description("Check status and health of the Wazoo API service")
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await getHealth();
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Health check failed:", err.message || err);
        process.exit(1);
      }
    });
}
