import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Sheet } from "../ui/sheet";
import { useTranslation } from "../../i18n/useTranslation";
import { useNavigation } from "./useNavigation";
import { secondaryTextClass } from "../../utils/cssConstants";

export function MobileMoreSheet({ open, onClose, onSettingsOpen }: { open: boolean; onClose: () => void; onSettingsOpen: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { all, mobileMore } = useNavigation();

  const currentNavLabel = all.find((n) => n.path === pathname)?.label || t("home");

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-2 pt-[5px] pb-[3px]">
        <p className="text-sm font-bold">{t("more")}</p>
        <p className={secondaryTextClass}>{currentNavLabel}</p>
      </div>
      <nav className="py-1 overflow-y-auto">
        {mobileMore.map((item) => (
          <button
            type="button"
            key={item.path}
            onClick={() => {
              onClose();
              navigate(item.path);
            }}
            className={`w-full flex items-center gap-2 px-2 py-2 text-sm text-left ${pathname === item.path ? "bg-selected" : ""} hover:bg-hover`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <div className="my-1" />
        <button
          type="button"
          onClick={() => {
            onClose();
            onSettingsOpen();
          }}
          className="w-full flex items-center gap-2 p-2 text-sm text-left text-text-secondary hover:text-text-primary hover:bg-hover"
        >
          <Settings size={18} />
          <span>{t("settings")}</span>
        </button>
      </nav>
    </Sheet>
  );
}
