"use client";
import { useLanguage } from '../context/LanguageContext';
import { Link3D } from './Link3D';

export default function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="py-10 bg-transparent border-t border-white/10 mt-auto backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-white/40 uppercase tracking-widest">
                <p className="text-stone-500 text-sm">
                    &copy; 2026 VoltSMS. {t('foot_all_rights')}
                </p>
                <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0 justify-center md:justify-end">
                    <Link3D href="/about" className="hover:text-white transition-colors">{t('foot_about')}</Link3D>
                    <Link3D href="/contact" className="hover:text-white transition-colors">{t('foot_contact')}</Link3D>
                    <Link3D href="/terms" className="hover:text-white transition-colors">{t('foot_terms')}</Link3D>
                    <Link3D href="/privacy" className="hover:text-white transition-colors">{t('foot_privacy')}</Link3D>
                    <Link3D href="/disclaimer" className="hover:text-white transition-colors">{t('foot_disclaimer')}</Link3D>
                </div>
            </div>
        </footer>
    );
}
