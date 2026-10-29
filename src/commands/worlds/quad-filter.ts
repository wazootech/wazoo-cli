function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function isQuadFilter(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const { include, exclude } = value as Record<string, unknown>;
  for (const block of [include, exclude]) {
    if (block === undefined) continue;
    if (typeof block !== "object" || block === null) return false;
    const { subjects, predicates, graphs } = block as Record<string, unknown>;
    for (const list of [subjects, predicates, graphs]) {
      if (list === undefined) continue;
      if (!isStringArray(list)) return false;
    }
  }
  return true;
}
