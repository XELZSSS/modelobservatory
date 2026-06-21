import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation, type TranslationKey } from "../../shared/i18n/useTranslation";
import { useSearchAllRankings } from "../../shared/hooks/useQueries";
import { useSearchStore } from "../../shared/stores/searchStore";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { cn } from "../../shared/utils/cn";

export function SearchInput() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchTerm = useSearchStore((s) => s.searchTerm);
  const setSearchTerm = useSearchStore((s) => s.setSearchTerm);

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
      <div className="flex items-center gap-1 border border-border rounded-md bg-bg-primary px-1.5 py-[3px]">
        <Search size={14} className={secondaryTextClass} />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) setIsOpen(true);
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full text-sm bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
        />
        {searchTerm && (
          <button
            type="button"
            aria-label={t("clear")}
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
          >
            <X size={14} className={secondaryTextClass} />
          </button>
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-bg-primary border border-border rounded-md z-50">
          <div className="p-1">
            {results.map((result) => (
              <button
                key={`${result.source}-${result.id}`}
                type="button"
                className="w-full text-left p-2 hover:bg-hover rounded-md transition-colors"
                onClick={() => handleResultClick(result.link)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary truncate">{result.name}</span>
                  {result.score != null && (
                    <span className="text-xs text-text-secondary ml-2 shrink-0">
                      {result.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-xs", secondaryTextClass)}>{t(result.source as TranslationKey)}</span>
                  {result.provider && (
                    <span className={cn("text-xs", secondaryTextClass)}>{result.provider}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
