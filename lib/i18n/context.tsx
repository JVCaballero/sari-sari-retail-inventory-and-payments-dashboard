'use client';

import React, { createContext, useContext, useState } from 'react';
import { translations, LanguageCode, TranslationDictionary } from './translations';

export type Language = LanguageCode;

interface I18nContextType {
  lang: LanguageCode;
  language: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tindahalin_lang') as LanguageCode;
      if (saved && (saved === 'en' || saved === 'ceb' || saved === 'fil')) {
        return saved;
      }
    }
    return 'en';
  });

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tindahalin_lang', newLang);
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <I18nContext.Provider
      value={{
        lang,
        language: lang,
        setLang,
        setLanguage: setLang,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
