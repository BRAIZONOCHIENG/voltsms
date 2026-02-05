import Navbar from '../../components/Navbar';

export default function Support() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-3xl py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-white">How can we help?</h1>
                    <p className="text-white/60 text-lg">
                        Check our FAQ below or reach out to our team.
                    </p>
                </div>

                <div className="space-y-4 mb-12">
                    {/* FAQ Items */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-2 text-white">Do these numbers work for Tinder?</h3>
                        <p className="text-white/70">
                            Yes! We use high-quality non-VoIP SIM cards that are verified to work on Tinder, WhatsApp, and other strict services.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-2 text-white">What if the code doesn't arrive?</h3>
                        <p className="text-white/70">
                            You will not be charged. Our system checks for the SMS code for 10-15 minutes. If it doesn't arrive, the order is cancelled and your balance remains untouched.
                        </p>
                    </div>
                </div>

                <div className="bg-primary rounded-3xl p-10 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                        Need help? Our team is available 24/7 to assist you with verifications, payments, and API integration.
                    </p>
                    <a href="mailto:support@voltsms.store" className="bg-primary-dark text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-stone-900 transition-colors">
                        Contact Support
                    </a>
                </div>

            </div>
        </main>
    );
}
