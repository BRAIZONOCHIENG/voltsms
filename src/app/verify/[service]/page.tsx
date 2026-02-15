import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { COUNTRIES } from '@/app/dashboard/countries';
import { SEO_SERVICES, SEO_COUNTRIES } from '@/app/verify/constants';
import { FaCheckCircle, FaGlobe, FaShieldAlt, FaBolt } from 'react-icons/fa';

interface Props {
    params: Promise<{ service: string }>;
}

export async function generateStaticParams() {
    return SEO_SERVICES.map((s) => ({
        service: s.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { service: serviceSlug } = await params;
    const service = SEO_SERVICES.find((s) => s.slug === serviceSlug);

    if (!service) return { title: 'Not Found' };

    const title = `Get a Non-VoIP ${service.name} Verification Number | Real SIM | VoltSMS`;
    const description = `The #1 service for ${service.name} verification using Real SIM cards. Bypasses all VoIP filters. Instant SMS arrival from 180+ countries. Starting from $0.95.`;

    return {
        title,
        description,
        keywords: [
            `${service.name} verification`,
            `${service.name} non-voip`,
            `${service.name} burner number`,
            `bypass ${service.name} sms`,
            `real sim for ${service.name}`,
        ],
        openGraph: {
            title,
            description,
            url: `https://voltsms.store/verify/${serviceSlug}`,
        },
    };
}

export default async function ServiceHubPage({ params }: Props) {
    const { service: serviceSlug } = await params;
    const service = SEO_SERVICES.find((s) => s.slug === serviceSlug);

    if (!service) notFound();

    // Get popular countries for this service
    const popularCountries = COUNTRIES.filter((c) =>
        SEO_COUNTRIES.includes(c.code)
    ).slice(0, 12);

    return (
        <main className="min-h-screen text-white relative overflow-hidden flex flex-col">
            <Navbar />

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10 flex-1">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 font-bold text-xs uppercase tracking-widest"
                    >
                        Real SIM Verification Hub
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
                        Non-VoIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{service.name}</span> Numbers
                    </h1>
                    <p className="text-xl text-stone-400 leading-relaxed font-light mb-10">
                        Ditch the unreliable virtual numbers. VoltSMS provides residential, non-VoIP numbers for {service.name} that are guaranteed to bypass security filters and receive OTP codes instantly.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register">
                            <button className="bg-white text-black font-black px-12 py-5 rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/5">
                                Get Your Number Now
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {[
                        { icon: <FaShieldAlt className="text-red-400" />, t: "Real SIM Network", d: "Numbers are tied to physical 4G/LTE towers, not simulated servers." },
                        { icon: <FaBolt className="text-yellow-400" />, t: "Instant OTP Delivery", d: "Codes arrive in under 30 seconds. No more waiting or retrying." },
                        { icon: <FaGlobe className="text-blue-400" />, t: "180+ Countries", d: "Global availability for local accounts in any region." },
                        { icon: <FaCheckCircle className="text-green-400" />, t: "100% Privacy", d: "No ID or personal phone number required. Pay with Crypto." },
                    ].map((b, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="mb-4 text-3xl">{b.icon}</div>
                            <h3 className="text-lg font-bold mb-2">{b.t}</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">{b.d}</p>
                        </div>
                    ))}
                </div>

                {/* Country Selector */}
                <div className="mb-24">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Select a Country</h2>
                            <p className="text-stone-400">Available Real SIM locations for {service.name} verification.</p>
                        </div>
                        <div className="text-stone-500 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            ⚡ 56 Locations Online
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {popularCountries.map((c) => (
                            <Link
                                key={c.code}
                                href={`/verify/${serviceSlug}/${c.code.toLowerCase()}`}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all flex items-center gap-4"
                            >
                                <span className="text-4xl">{c.flag}</span>
                                <div>
                                    <div className="font-bold text-stone-200 group-hover:text-white transition-colors">{c.name}</div>
                                    <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{service.name} No.</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/dashboard" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                            View All 180+ Countries &rarr;
                        </Link>
                    </div>
                </div>

                {/* Technical Explanation */}
                <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[3rem] p-8 md:p-16 mb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Why {service.name} Blocks VoIP</h2>
                            <p className="text-stone-400 text-lg leading-relaxed mb-6 font-light">
                                Modern platforms like {service.name} use advanced detection to identify "Virtual" numbers. If your service uses data-center IPs, your verification will fail.
                            </p>
                            <div className="space-y-4 text-stone-300 text-sm">
                                <div className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1" />
                                    <span>VoltSMS uses real hardware hubs with residential SIM cards.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1" />
                                    <span>Your number is seen as a real person with a real mobile carrier.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1" />
                                    <span>Zero risk of being shadow-banned or flagged for "suspicious activity".</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                            <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
                                <div className="font-mono text-xs text-stone-500 mb-4 tracking-widest uppercase">System Diagnostic</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-stone-400">Carrier Verification</span>
                                        <span className="text-green-400">PASSED</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-stone-400">VoIP Filter Detection</span>
                                        <span className="text-green-400">CLEAN</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-stone-400">Residential IP Check</span>
                                        <span className="text-green-400">RESIDENTIAL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-400">OTP Success Rate</span>
                                        <span className="text-white font-bold">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Client-side wrappers for framer-motion if needed, but keeping it simple for SEO
function motionDiv({ children, ...props }: any) {
    return <div {...props}>{children}</div>;
}

const motion = {
    div: motionDiv
};
