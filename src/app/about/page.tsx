"use client";
import Navbar from '../../components/Navbar';

export default function About() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-xl">
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">About Us</h1>

                    <div className="prose prose-invert max-w-none space-y-6 text-white/80 leading-relaxed text-sm md:text-base">
                        <p>
                            Welcome to <strong>VoltSMS</strong>, the premier destination for secure, anonymous, and instant SMS verification services. In an era where digital privacy is increasingly compromised, we stand as a fortress for your personal identity.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">Our Mission</h3>
                        <p>
                            We believe that privacy is a fundamental human right, not a luxury. Our mission is to empower individuals worldwide to access digital services without surrendering their personal phone numbers to data brokers, marketers, and surveillance mechanisms. We provide a buffer—a secure layer of anonymity—that allows you to exist online on your own terms.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">Why Choose Us?</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Uncompromised Quality:</strong> We exclusively utilize real, non-VoIP SIM cards from over 50 countries. This ensures the highest success rates in the industry for bypassing complex verification systems used by major platforms like Tinder, Telegram, and Google.</li>
                            <li><strong>Absolute Anonymity:</strong> We do not ask for your ID. We do not track your activity. We accept cryptocurrency to ensure your financial data remains private.</li>
                            <li><strong>State-of-the-Art Technology:</strong> Our platform is built on cutting-edge infrastructure that delivers SMS codes in seconds, not minutes. </li>
                        </ul>

                        <h3 className="text-white text-xl font-bold mt-8">Our Commitment</h3>
                        <p>
                            We are committed to continuous innovation in the field of privacy tech. As platforms evolve their detection methods, we evolve our network to stay ahead. When you use VoltSMS, you are using the most robust verification tool available on the market.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
