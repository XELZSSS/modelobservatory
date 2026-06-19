import { useState, useEffect } from "react";
import { useThemeStore } from "../../stores/themeStore";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SettingsSheet } from "./SettingsSheet";
import { MobileMoreSheet } from "./MobileMoreSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-bg-primary focus:border focus:border-border focus:rounded-md focus:text-sm">
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] px-2 md:px-6 pt-2 md:pt-[10px] pb-[calc(72px+env(safe-area-inset-bottom,0px))] sm:pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-[80px]">
        {children}
      </main>
      <DesktopNav onSettingsOpen={() => setSettingsOpen(true)} />
      <MobileNav onMoreOpen={() => setMobileMoreOpen(true)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MobileMoreSheet open={mobileMoreOpen} onClose={() => setMobileMoreOpen(false)} onSettingsOpen={() => setSettingsOpen(true)} />
    </div>
  );
}
