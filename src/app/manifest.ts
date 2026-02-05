import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VoltSMS - Instant SMS Verification',
        short_name: 'VoltSMS',
        description: 'Get instant SMS verification codes for Tinder, Telegram, WhatsApp, and more via real SIM cards.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#7c3aed',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
