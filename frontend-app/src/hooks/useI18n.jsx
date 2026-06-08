import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ko from '@/locales/ko.json';
import en from '@/locales/en.json';
import ja from '@/locales/ja.json';

const LOCALES = { ko, en, ja };

export function useI18n() {
  const { language } = useLanguage();
  const dict = useMemo(() => LOCALES[language] || LOCALES['ko'], [language]);

  function t(path, fallback = '') {
    if (!path) return fallback;
    const parts = path.split('.');
    let cur = dict;
    for (const p of parts) {
      if (!cur) return fallback || path;
      cur = cur[p];
    }
    return cur ?? fallback ?? path;
  }

  return { t, language };
}

export default useI18n;
