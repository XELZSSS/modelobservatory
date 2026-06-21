export function useModelLookup<T>(data: T[], id: string, ...keys: (keyof T & string)[]): T | undefined {
  return data.find((item) => keys.some((key) => (item as Record<string, unknown>)[key] === id));
}
