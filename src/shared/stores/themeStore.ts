import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "../types";
import { STORAGE_KEYS } from "../constants";

interface ThemeState {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") as "light" | "dark",
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === "light" ? "dark" : "light",
        })),
    }),
    { name: STORAGE_KEYS.theme },
  ),
);
