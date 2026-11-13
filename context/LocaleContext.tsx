import { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

type Locale = "en" | "ar";
type Dictionary = Record<string, unknown>;
const dictionaries: Record<Locale, Dictionary> = { en, ar };
const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const locale: Locale = pathname.match(/^\/ar(?:\/|$)/) ? "ar" : "en";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useTranslations(namespace?: string) {
  const locale = useLocale();
  const messages = dictionaries[locale];
  return (key: string, values?: Record<string, string | number>) => {
    const fullKey = [namespace, key].filter(Boolean).join(".");
    const value = fullKey.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object") return undefined;
      return (current as Dictionary)[part];
    }, messages);
    if (typeof value !== "string") return fullKey;
    return Object.entries(values ?? {}).reduce(
      (result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)),
      value,
    );
  };
}
