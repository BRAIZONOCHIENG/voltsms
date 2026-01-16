"use client";
// import Link from 'next/link';
import { Link3D } from './Link3D';

export default function Footer() {
    return (
        <footer className="py-10 bg-transparent border-t border-white/10 mt-auto backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-white/40 uppercase tracking-widest">
                <p className="text-stone-500 text-sm">
                    &copy; 2026 VoltSMS. All rights reserved.
                </p>
                <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0 justify-center md:justify-end">
                    <Link3D href="/about" className="hover:text-white transition-colors">About</Link3D>
                    <Link3D href="/contact" className="hover:text-white transition-colors">Contact</Link3D>
                    <Link3D href="/terms" className="hover:text-white transition-colors">Terms</Link3D>
                    <Link3D href="/privacy" className="hover:text-white transition-colors">Privacy</Link3D>
                    <Link3D href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link3D>
                </div>
            </div>
        </footer>
    );
}
