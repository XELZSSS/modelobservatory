import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearchStore } from "../stores/search";

export function useSearchResetOnNavigate() {
  const location = useLocation();
  const resetSearch = useSearchStore((s) => s.resetSearch);

  useEffect(() => {
    resetSearch();
  }, [location.pathname, resetSearch]);
}