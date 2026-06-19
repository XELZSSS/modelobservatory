import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "../i18n";
import { STORAGE_KEYS } from "../constants";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "zh",
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((state) => ({ lang: state.lang === "en" ? "zh" : "en" })),
    }),
    {
      name: STORAGE_KEYS.lang,
    },
  ),
);
