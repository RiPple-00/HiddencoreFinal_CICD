import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ddasum_selected_language';
const DEFAULT_LANGUAGE = 'ko';

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setLanguage(saved);
        }
      } catch (error) {
        console.warn('Failed to load language from storage:', error);
      }
    }

    loadLanguage();
  }, []);

  useEffect(() => {
    async function saveLanguage() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, language);
      } catch (error) {
        console.warn('Failed to save language to storage:', error);
      }
    }

    saveLanguage();
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
