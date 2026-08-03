import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation, type TranslationKey } from "../../shared/i18n/useTranslation";
import { useSearchAllRankings } from "../../shared/hooks/useSearch";
import { useSearchStore } from "../../shared/stores/searchStore";

import { cn } from "../../shared/utils/cn";

const DEBOUNCE_MS = 250;

export function SearchInput() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchTerm = useSearchStore((s) => s.searchTerm);
  const setSearchTerm = useSearchStore((s) => s.setSearchTerm);
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, setSearchTerm]);

  const results = useSearchAllRankings(searchTerm);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleResultClick(link: string) {
    navigate(link);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-48 sm:w-56">
      <div className="flex items-center gap-1.5 border border-border rounded-lg bg-bg-card px-2.5 py-1.5">
        <Search size={14} className="text-text-secondary" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (inputValue.length >= 2) setIsOpen(true);
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full text-sm bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
        />
        {inputValue && (
          <button
            type="button"
            aria-label={t("clear")}
            onClick={() => {
              setInputValue("");
              setIsOpen(false);
            }}
          >
            <X size={14} className="text-text-secondary" />
          </button>
        )}
      </div>

      {isOpen && inputValue.length >= 2 && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-80 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-bg-card border border-border rounded-lg shadow-lg z-50 sm:w-64">
          <div className="p-1">
            {results.map((result) => (
              <button
                key={`${result.source}-${result.id}`}
                type="button"
                className="w-full text-left p-2.5 hover:bg-hover rounded-md transition-colors"
                onClick={() => handleResultClick(result.link)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary truncate">{result.name}</span>
                  {result.score != null && <span className="text-xs text-text-secondary ml-2 shrink-0 font-mono">{result.score.toFixed(1)}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary">{t(result.source as TranslationKey)}</span>
                  {result.provider && <span className="text-xs text-text-secondary">{result.provider}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
