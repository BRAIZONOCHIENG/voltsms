
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - VoltSMS Dashboard',
    description: 'Log in to your VoltSMS dashboard to manage virtual numbers, view SMS messages, and top up your balance.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
