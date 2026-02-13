import { Metadata } from 'next';
import AffiliateClient from './AffiliateClient';

export const metadata: Metadata = {
    title: 'Affiliate Program - Earn 15% Lifetime Commission | VoltSMS',
    description: 'Join the VoltSMS affiliate program and earn 15% lifetime commission on every user you refer. Premium Non-VoIP numbers, instant delivery, and fast crypto payouts.',
    keywords: ['affiliate program', 'make money online', 'sms verification affiliate', 'referral program', 'crypto affiliate'],
};

export default function AffiliatePage() {
    return <AffiliateClient />;
}
