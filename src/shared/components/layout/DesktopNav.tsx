import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/useTranslation";
import { useNavigation, isNavActive } from "./useNavigation";

export function DesktopNav({ onSettingsOpen }: { onSettingsOpen: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { all } = useNavigation();
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex fixed bottom-4 left-0 right-0 mx-auto w-fit z-50 items-center gap-1 px-2 py-1.5 bg-nav-bg backdrop-blur-xl border border-border rounded-md">
      {all.map((item) => (
        <button
          type="button"
          key={item.path}
          aria-label={item.label}
          aria-current={isNavActive(pathname, item) ? "page" : undefined}
          onClick={() => navigate(item.path)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap hover:bg-hover ${isNavActive(pathname, item) ? "bg-selected" : ""}`}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        aria-label={t("settings")}
        onClick={onSettingsOpen}
        className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap hover:bg-hover"
      >
        {t("settings")}
      </button>
    </nav>
  );
}
