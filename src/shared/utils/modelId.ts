/** Extract the primary identifier for an AA-like model, preferring id over slug. */
export function modelId(m: { id?: string; slug?: string }): string {
  return m.id || m.slug || "";
}
