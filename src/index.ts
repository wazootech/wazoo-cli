import { Command } from "commander";
import { registerHealthCommand } from "./commands/health.js";
import { registerWorldsCommand } from "./commands/worlds.js";
import { registerTokensCommand } from "./commands/tokens.js";
import { registerUsageCommand } from "./commands/usage.js";

const program = new Command();

program
  .name("wazoo")
  .description("Official CLI for Wazoo Platform - Neuro-symbolic infrastructure for AI agents")
  .version("0.1.0")
  .option("--api-url <url>", "Wazoo API base URL (overrides WAZOO_API_URL)")
  .option("--token <token>", "Wazoo API authentication token (overrides WAZOO_API_TOKEN / WORLDS_TOKEN)")
  .option("--json", "Output response data in JSON format", false);

registerHealthCommand(program);
registerWorldsCommand(program);
registerTokensCommand(program);
registerUsageCommand(program);

program.parseAsync(process.argv).catch((err) => {
  console.error("CLI error:", err);
  process.exit(1);
});
