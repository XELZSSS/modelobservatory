import { useMemo } from "react";
import { useSearchStore } from "../stores/searchStore";

export function useFilteredData<T>(data: T[], getSearchFields: (item: T) => string[]): T[] {
  const searchTerm = useSearchStore((s) => s.searchTerm);
  return useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return data;
    return data.filter((item) => getSearchFields(item).some((field) => field.toLowerCase().includes(term)));
  }, [data, searchTerm, getSearchFields]);
}
