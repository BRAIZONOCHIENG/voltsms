"use client";
import Navbar from '../../components/Navbar';

export default function Terms() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-xl">
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Terms of Service</h1>

                    <div className="prose prose-invert max-w-none space-y-6 text-white/80 leading-relaxed text-sm md:text-base">
                        <p className="font-bold">Effective Date: January 1, 2026</p>

                        <p>
                            Please read these Terms of Service ("Terms") carefully before using the VoltSMS website (the "Service"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">2. Accounts and Registration</h3>
                        <p>
                            When you create an account with us, you must provide a secure password. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage the use of strong, unique passwords.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">3. Refunds and Payments</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Failed Verifications:</strong> If a number fails to receive a code within the timeout period (usually 15-20 minutes), the transaction is automatically cancelled, and the funds are instantly returned to your account balance.</li>
                            <li><strong>Crypto Deposits:</strong> Cryptocurrency deposits are final. Due to the irreversible nature of blockchain transactions, we cannot reverse a deposit once it has been confirmed on the network.</li>
                            <li><strong>Refund Requests:</strong> Refunds of unused account balances back to an external wallet are handled on a case-by-case basis and may be subject to a processing fee. Please contact support.</li>
                        </ul>

                        <h3 className="text-white text-xl font-bold mt-8">4. Prohibited Behaviors</h3>
                        <p>
                            You agree not to use the Service to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Engage in any form of harassment, stalking, or abuse.</li>
                            <li>Commit fraud or financial crimes.</li>
                            <li>Distribute spam or malware.</li>
                            <li>Violate the laws of your local jurisdiction.</li>
                        </ul>
                        <p>
                            Violation of these terms will result in immediate termination of your account without refund.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">5. Changes to Terms</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
