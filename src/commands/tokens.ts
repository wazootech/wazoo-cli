import { Command } from "commander";
import { listPlatformTokens, createPlatformToken } from "@wazoo/client";
import { configureClient, formatOutput, GlobalOptions } from "../client.js";

export function registerTokensCommand(program: Command) {
  const tokens = program
    .command("tokens")
    .description("Manage platform authentication tokens");

  tokens
    .command("list")
    .description("List your platform API tokens")
    .action(async () => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await listPlatformTokens();
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Failed to list tokens:", err.message || err);
        process.exit(1);
      }
    });

  tokens
    .command("create")
    .description("Create a new API token")
    .requiredOption("-n, --name <name>", "Token descriptive label")
    .action(async (cmdOpts: { name: string }) => {
      const opts = program.opts<GlobalOptions>();
      configureClient(opts);

      try {
        const response = await createPlatformToken({
          body: { name: cmdOpts.name },
        });
        formatOutput(response.data ?? response, opts.json);
      } catch (err: any) {
        console.error("Failed to create token:", err.message || err);
        process.exit(1);
      }
    });
}
