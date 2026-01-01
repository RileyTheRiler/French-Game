import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle Language"
        >
            <Globe size={18} />
            <span className="uppercase font-medium text-xs tracking-wider">
                {i18n.language === 'en' ? 'EN' : 'FR'}
            </span>
        </Button>
    );
};

export default LanguageSwitcher;
