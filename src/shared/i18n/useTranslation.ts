import { createContext, use } from "react";
import type { en } from "./locales/en";

export type Lang = "en" | "zh";
export type TranslationKey = keyof typeof en;
export type TranslationParams = Record<string, string | number>;
export type TFunction = (key: TranslationKey, params?: TranslationParams) => string;

interface I18nContextValue {
  lang: Lang;
  t: TFunction;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useTranslation() {
  const context = use(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
