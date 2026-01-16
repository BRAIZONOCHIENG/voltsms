"use client";
import Navbar from '../../components/Navbar';

export default function Privacy() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-xl">
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Privacy Policy</h1>

                    <div className="prose prose-invert max-w-none space-y-6 text-white/80 leading-relaxed text-sm md:text-base">
                        <p className="font-bold">Last Updated: January 1, 2026</p>

                        <p>
                            At VoltSMS, we take your anonymity seriously. This Privacy Policy specifically outlines what data we collect, how we use it, and most importantly, what we <strong>do not</strong> collect. By using our service, you acknowledge that our primary directive is data minimization.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">1. Data We Do Not Collect</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>No Real Identities:</strong> We never request government IDs, social security numbers, or real names.</li>
                            <li><strong>No IP Logging:</strong> We do not maintain access logs of IP addresses associated with user accounts. Access logs are automatically rotated and permanently wiped every 24 hours.</li>
                            <li><strong>No Usage Monitoring:</strong> We do not monitor the content of the SMS messages you receive, nor do we track which services you are verifying, except for the automated purpose of routing the message to your dashboard.</li>
                        </ul>

                        <h3 className="text-white text-xl font-bold mt-8">2. Data We Collect</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Credentials:</strong> We store a salted & hashed version of your chosen password.</li>
                            <li><strong>Transaction Ledger:</strong> To maintain your balance, we store a history of deposits and usage (cost + service type) linked to your internal User ID. This differs from your real-world identity.</li>
                            <li><strong>Temporary SMS Data:</strong> The content of SMS messages is stored temporarily to display it to you in the dashboard. Users may manually delete this data at any time, or it will be automatically purged after a set retention period.</li>
                        </ul>

                        <h3 className="text-white text-xl font-bold mt-8">3. Cookies and Tracking</h3>
                        <p>
                            We use a single session cookie (JWT) solely for the purpose of keeping you logged in. We do not use third-party analytics pixels, tracking cookies, or advertising beacons. Your browsing habits on our site are private.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">4. Data Disclosure</h3>
                        <p>
                            We will not sell, trade, or transfer your data to outside parties. Since we do not collect personal identities, we cannot respond to requests for user identification. We are structured to protect user privacy by design.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
