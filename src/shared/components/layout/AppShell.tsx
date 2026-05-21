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
      <main className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] px-2 md:px-6 pt-2 md:pt-[10px] pb-[calc(72px+env(safe-area-inset-bottom,0px))] sm:pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-[80px]">
        {children}
      </main>
      <DesktopNav onSettingsOpen={() => setSettingsOpen(true)} />
      <MobileNav onMoreOpen={() => setMobileMoreOpen(true)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MobileMoreSheet open={mobileMoreOpen} onClose={() => setMobileMoreOpen(false)} onSettingsOpen={() => setSettingsOpen(true)} />
    </div>
  );
}
