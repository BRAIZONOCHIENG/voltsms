export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const dns = await import('dns');
        // @ts-ignore
        if (dns.default?.setDefaultResultOrder) {
            // @ts-ignore
            dns.default.setDefaultResultOrder('ipv4first');
        } else if (dns.setDefaultResultOrder) {
            dns.setDefaultResultOrder('ipv4first');
        }
    }
}
