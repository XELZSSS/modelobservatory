import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/useTranslation";
import { useNavigation, isNavActive } from "./useNavigation";
import { Settings } from "lucide-react";

export function DesktopNav({ onSettingsOpen }: { onSettingsOpen: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { all } = useNavigation();
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center border-b border-border bg-nav-bg backdrop-blur-lg px-6">
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label={t("home")}
        className="flex items-center gap-2 mr-8 shrink-0"
      >
        <svg fill="#8B5CF6" viewBox="0 0 24 24" className="size-5" xmlns="http://www.w3.org/2000/svg"><path d="M4.59 7.41l4.94 3.54L4.59 24zm0-7.41v6.36l9.53 5.29 4.59-3.52zm0 24l14.82-8.47v-6.7Z"/></svg>
        <span className="text-sm font-bold">Model Observatory</span>
      </button>
      <div className="flex items-center gap-1">
        {all.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <button
              type="button"
              key={item.path}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => navigate(item.path)}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                active
                  ? "text-accent bg-accent-light"
                  : "text-text-secondary hover:text-text-primary hover:bg-hover"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="ml-auto">
        <button
          type="button"
          aria-label={t("settings")}
          onClick={onSettingsOpen}
          className="p-2 text-text-secondary hover:text-text-primary rounded-md hover:bg-hover transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </nav>
  );
}
