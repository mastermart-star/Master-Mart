"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DICTIONARY, type Dictionary, type Lang } from "@/lib/dictionary";

const STORAGE_KEY = "master_mart_lang";

type LanguageContextValue = {
  lang: Lang;
  dict: Dictionary;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Language lives in localStorage + React context — deliberately NOT in a
 * cookie, so public routes stay statically prerendered (CLAUDE.md §3.2).
 * Defaults to Bengali, matching the original app.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    // One-time hydration from localStorage after mount. The server cannot know
    // the visitor's language (that would force dynamic rendering), so the SSR
    // HTML always shows the default and this effect corrects it client-side.
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached === "en" || cached === "bn") setLangState(cached);
    } catch {
      // storage unavailable — keep default
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "bn" : "en");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider
      value={{ lang, dict: DICTIONARY[lang], toggleLang, setLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
