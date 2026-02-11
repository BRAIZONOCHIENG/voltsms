
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - Create VoltSMS Account',
    description: 'Sign up for VoltSMS to get instant access to disposable phone numbers for SMS verification. Fast, secure, and crypto-friendly.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
