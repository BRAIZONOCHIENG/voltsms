import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { COUNTRIES } from '@/app/dashboard/countries';
import { SEO_SERVICES, SEO_COUNTRIES } from '@/app/verify/constants';

interface Props {
    params: Promise<{ service: string; country: string }>;
}

export async function generateStaticParams() {
    const params: { service: string; country: string }[] = [];

    for (const service of SEO_SERVICES) {
        for (const countryCode of SEO_COUNTRIES) {
            params.push({
                service: service.slug,
                country: countryCode.toLowerCase(),
            });
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { service: serviceSlug, country: countryCodeLower } = await params;

    const service = SEO_SERVICES.find(s => s.slug === serviceSlug);
    const country = COUNTRIES.find(c => c.code.toLowerCase() === countryCodeLower.toLowerCase());

    if (!service || !country) {
        return { title: 'Not Found' };
    }

    const title = `Verify ${service.name} in ${country.name} - Non-VoIP SMS | VoltSMS`;
    const description = `Get a real ${country.name} phone number for ${service.name} verification instantly. Premium Non-VoIP SIM cards. working 100% for OTP bypass.`;

    return {
        title,
        description,
        keywords: [
            `${service.name} verification ${country.name}`,
            `${service.name} non voip number`,
            `bypass ${service.name} otp`,
            `${country.name} virtual number for ${service.name}`,
            `receive sms ${country.name}`,
            `real sim card ${country.name}`
        ],
        openGraph: {
            title,
            description,
            url: `https://voltsms.store/verify/${serviceSlug}/${countryCodeLower}`,
        },
        alternates: {
            canonical: `https://voltsms.store/verify/${serviceSlug}/${countryCodeLower}`,
        }
    };
}

export default async function VerifyPage({ params }: Props) {
    const { service: serviceSlug, country: countryCodeLower } = await params;

    const service = SEO_SERVICES.find(s => s.slug === serviceSlug);
    const country = COUNTRIES.find(c => c.code.toLowerCase() === countryCodeLower.toLowerCase());

    if (!service || !country) {
        notFound();
    }

    return (
        <main className="min-h-screen text-white relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10 flex-1 flex flex-col justify-center items-center">

                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-green-400 font-bold text-sm uppercase tracking-widest">
                        Available Now • Instant Delivery
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                        Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{service.name}</span> <br />
                        in <span className="text-white">{country.name}</span>
                    </h1>

                    <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Stop getting blocked by VoIP detection. Get a <b>Real SIM</b> number from {country.name} {country.flag} to verify {service.name} account instantly.
                        Guaranteed to receive OTP codes.
                    </p>

                    <Link href="/register" className="inline-flex items-center gap-4 bg-white text-black font-black text-xl px-12 py-5 rounded-full hover:scale-105 transition-transform shadow-2xl shadow-purple-500/20">
                        <span>Get Number for {service.name}</span>
                        <span>→</span>
                    </Link>
                    <p className="mt-4 text-sm text-white/40 font-medium">No ID Required • Crypto Accepted</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-20">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🛡️</div>
                        <h3 className="text-xl font-bold mb-2">Non-VoIP {country.name} Number</h3>
                        <p className="text-stone-400 text-sm">Real physical SIM cards that bypass {service.name}'s anti-spam filters.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold mb-2">Instant OTP Delivery</h3>
                        <p className="text-stone-400 text-sm">Code arrives in seconds. If it doesn't arrive, you don't pay.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl mb-4">🕵️</div>
                        <h3 className="text-xl font-bold mb-2">100% Anonymous</h3>
                        <p className="text-stone-400 text-sm">Protect your privacy. Sign up with just an email and pay with Crypto.</p>
                    </div>
                </div>

                {/* Breadcrumb / SEO Links */}
                <div className="max-w-4xl mx-auto text-center border-t border-white/10 pt-16 mt-auto">
                    <h2 className="text-2xl font-bold mb-6">Popular Verification in {country.name}</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {SEO_SERVICES.filter(s => s.slug !== serviceSlug).slice(0, 20).map(s => (
                            <Link
                                key={s.slug}
                                href={`/verify/${s.slug}/${countryCodeLower}`}
                                className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-sm text-stone-300 transition-colors"
                            >
                                {s.name} {country.name}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
