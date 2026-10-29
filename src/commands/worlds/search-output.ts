import { formatOutput } from "../../client.js";

/**
 * Renders search output in human-readable form: the search mode that actually
 * ran, plus each result's normalized score and scoreType. `--json` keeps the
 * raw contract response.
 */
export function formatSearchOutput(data: unknown, jsonMode?: boolean) {
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
