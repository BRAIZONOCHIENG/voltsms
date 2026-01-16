"use client";
import Navbar from '../../components/Navbar';

export default function Disclaimer() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-xl">
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Disclaimer</h1>

                    <div className="prose prose-invert max-w-none space-y-6 text-white/80 leading-relaxed text-sm md:text-base">
                        <h3 className="text-white text-xl font-bold mt-8">1. Service "As Is"</h3>
                        <p>
                            The services provided by VoltSMS are offered on an "as is" and "as available" basis. While we strive for 100% uptime and the highest success rates, we make no warranties, expressed or implied, regarding the availability, reliability, or accuracy of the phone numbers provided. Due to the nature of telecommunication networks, some numbers may fail to receive messages.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">2. Limitation of Liability</h3>
                        <p>
                            In no event shall VoltSMS, its directors, employees, or agents be liable for any indirect, incidental, special, or consequential damages arising out of using our service. This includes, but is not limited to, loss of accounts, loss of data, or banishment from third-party platforms (e.g., Tinder, Telegram, Gmail). You acknowledge that you use our numbers at your own risk.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">3. Third-Party Platforms</h3>
                        <p>
                            We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any of the companies or platforms for which we provide verification services (e.g., OpenAI, WhatsApp, Telegram). All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
                        </p>

                        <h3 className="text-white text-xl font-bold mt-8">4. Lawful Use Only</h3>
                        <p>
                            Our service is strictly intended for the protection of privacy and personal data. It is not to be used for any illegal activities, including fraud, harassment, spam, or bypassing legitimate security measures for malicious intent. We reserve the right to terminate service to any user found to be using our platform for unlawful purposes.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
