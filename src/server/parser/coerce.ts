export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export const numOr = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v ?? fallback);
  return Number.isFinite(n) ? n : fallback;
};

export const str = (v: unknown): string => (typeof v === "string" ? v : "");

export const strOr = (v: unknown): string | null | undefined => {
  if (v == null) return v;
  return typeof v === "string" ? v : undefined;
};

export const bool = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);

export const obj = (v: unknown): Record<string, unknown> | undefined =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;