import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const LOCALES = { ko, en, ja };

export function useI18n() {
  const { language, setLanguage } = useLanguage();

  const dict = useMemo(() => LOCALES[language] || LOCALES['ko'], [language]);

  function t(path, fallbackOrVars = '', vars) {
    if (!path) return typeof fallbackOrVars === 'string' ? fallbackOrVars : '';
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return typeof fallbackOrVars === 'string' ? fallbackOrVars : path;
      cur = cur[p];
    }
    let result = cur ?? (typeof fallbackOrVars === 'string' ? fallbackOrVars : path);
    if (typeof result !== 'string') return typeof fallbackOrVars === 'string' ? fallbackOrVars : path;
    const replacements = typeof fallbackOrVars === 'object' ? fallbackOrVars : vars;
    if (replacements) {
      result = result.replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? `{${key}}`);
    }
    return result;
  }

  return { t, language, setLanguage };
}

export default useI18n;
