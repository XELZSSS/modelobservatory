import { useMemo } from "react";

export function useRankMap<T>(data: T[], getId: (item: T) => string): Map<string, number> {
  return useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item, i) => map.set(getId(item), i + 1));
    return map;
  }, [data, getId]);
}
