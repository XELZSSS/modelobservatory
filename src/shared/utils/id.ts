export function modelId(m: { id?: string; slug?: string }): string {
  return m.id || m.slug || "";
}

export function findModel<T>(data: T[], id: string, ...keys: (keyof T & string)[]): T | undefined {
  return data.find((item) => keys.some((key) => (item as Record<string, unknown>)[key] === id));
}