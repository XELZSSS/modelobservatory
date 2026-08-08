import { createContext, use } from "react";
import type { Lang, TFunction } from "../../shared/i18n";

export interface I18nContextValue {
  lang: Lang;
  t: TFunction;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useTranslation() {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}