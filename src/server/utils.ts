export function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function settledValues<T>(results: readonly PromiseSettledResult<T>[]): T[] {
  return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}

export function deduplicateBy<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatSettleErrors(results: readonly PromiseSettledResult<unknown>[], labels: readonly string[]): string {
  return results
    .map((r, i) => (r.status === "rejected" ? `${labels[i] ?? i}: ${r.reason instanceof Error ? r.reason.message : r.reason}` : null))
    .filter(Boolean)
    .join("; ");
}
