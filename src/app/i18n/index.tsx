import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { useLangStore } from "../stores/lang";
import type { Lang, TFunction, TranslationKey } from "../../shared/i18n";
import { interpolate, dictionaries } from "../../shared/i18n";
import type { I18nContextValue } from "./useTranslation";
import { I18nContext } from "./useTranslation";

function resolveTemplate(key: TranslationKey, lang: Lang): string {
  return dictionaries[lang][key] || dictionaries.en[key] || key;
}

function syncDocumentMeta(lang: Lang) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) {
    desc.setAttribute(
      "content",
      lang === "zh"
        ? "Model Observatory - AI 模型数据看板，聚合排名、评测、价格、发布动态、提供商分析"
        : "Model Observatory - AI Model Dashboard aggregating rankings, benchmarks, pricing, releases, and provider analysis",
    );
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useLangStore((s) => s.lang);
  const setLangState = useLangStore((s) => s.setLang);
  const toggleLang = useLangStore((s) => s.toggleLang);

  const lastLang = useRef<Lang | null>(null);
  if (lastLang.current !== lang) {
    lastLang.current = lang;
    syncDocumentMeta(lang);
  }

  const setLang = useCallback((newLang: Lang) => setLangState(newLang), [setLangState]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let template = resolveTemplate(key, lang);
      if (params) template = interpolate(template, params);
      return template;
    },
    [lang],
  );

  const contextValue = useMemo<I18nContextValue>(() => ({ lang, t, setLang, toggleLang }), [lang, t, setLang, toggleLang]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export type { Lang, TranslationKey, TFunction } from "../../shared/i18n";
export { useTranslation } from "./useTranslation";