import { useCallback, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { en } from "./locales/en";
import { zh } from "./locales/zh";
import { useLangStore } from "../stores/langStore";
import { I18nContext } from "./useTranslation";
import type { Lang, TranslationKey, TranslationParams, TFunction } from "./useTranslation";
import { interpolate } from "./interpolate";

export type { Lang, TranslationKey, TranslationParams, TFunction };

const translations = { en, zh } as const;

function resolveTemplate(key: TranslationKey, lang: Lang): string {
  return translations[lang][key] || translations.en[key] || key;
}

function syncDocumentMeta(lang: Lang) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = "Model Observatory";
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

  useEffect(() => {
    syncDocumentMeta(lang);
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, [setLangState]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      let template = resolveTemplate(key, lang);
      if (params) {
        template = interpolate(template, params);
      }
      return template;
    },
    [lang],
  );

  const contextValue = useMemo(() => ({ lang, t, setLang, toggleLang }), [lang, t, setLang, toggleLang]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}
