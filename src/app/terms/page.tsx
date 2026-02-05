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

                        <h3 className="text-white text-xl font-bold mt-8">3. Payment & Refund Policy</h3>
                        <p>
                            By making a deposit or purchase on VoltSMS, you acknowledge and agree to the following strictly enforced policies regarding digital goods and cryptocurrency assets:
                        </p>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>
                                <strong>All Sales Are Final:</strong> Due to the immediate and consumable nature of digital verification services, all successful purchases where a verification code is delivered are final and non-refundable.
                            </li>
                            <li>
                                <strong>"No-Code" Protection Guarantee:</strong> We prioritize fair service. If a purchased number fails to receive a verification code within the active timeout period, the order will be automatically marked as failed, and the full credit amount will be <strong>instantly refunded to your VoltSMS account balance</strong> for use on a different service.
                            </li>
                            <li>
                                <strong>Cryptocurrency Deposits:</strong> You acknowledge that cryptocurrency transactions (Bitcoin, Litecoin, USDT, etc.) are technically irreversible. Once a deposit is confirmed on the blockchain, it cannot be canceled, reversed, or charged back. As such, <strong>we do not offer refunds of deposited funds back to external wallets</strong> under any circumstances. Balance is for platform use only.
                            </li>
                            <li>
                                <strong>Unused Balance:</strong> Account credits do not expire, but they hold no monetary value outside of the Service and cannot be redeemed for cash or crypto.
                            </li>
                            <li>
                                <strong>Account Termination:</strong> If your account is terminated due to a violation of our Terms (e.g., using the service for illegal activities), any remaining balance is immediately forfeited and will not be refunded.
                            </li>
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
