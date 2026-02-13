"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // 1. Check LocalStorage
        const savedLang = localStorage.getItem('volt_lang') as Language;
        if (savedLang && ['en', 'ru', 'zh', 'es', 'fr'].includes(savedLang)) {
            setLanguageState(savedLang);
            return;
        }

        // 2. IP-based detection (One-time)
        const detectLanguage = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const country = data.country_code;

                let autoLang: Language = 'en';
                if (country === 'RU' || country === 'BY' || country === 'KZ') autoLang = 'ru';
                else if (country === 'CN' || country === 'HK' || country === 'TW') autoLang = 'zh';
                else if (['ES', 'MX', 'AR', 'CO', 'CL'].includes(country)) autoLang = 'es';
                else if (['FR', 'BE', 'CH', 'CA'].includes(country)) autoLang = 'fr';

                if (autoLang !== 'en') {
                    setLanguageState(autoLang);
                    localStorage.setItem('volt_lang', autoLang);
                }
            } catch (e) {
                console.warn("Language detection failed, defaulting to EN");
            }
        };

        detectLanguage();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('volt_lang', lang);
    };

    const t = (key: string) => {
        if (!translations[key]) return key;
        return translations[key][language] || translations[key]['en'] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
