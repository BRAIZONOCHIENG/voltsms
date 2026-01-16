export const PACKETSTREAM_API_URL = 'https://reseller.packetstream.io/reseller';

export async function getPacketStreamKey() {
    const key = process.env.PACKETSTREAM_API_KEY;
    if (!key) throw new Error("PacketStream API Key not configured");
    return key;
}

export async function createResellerUser(username?: string) {
    const apiKey = await getPacketStreamKey();

    // Auto-generate username if not provided
    const finalUsername = username || `volt_${Math.random().toString(36).substring(7)}`;

    // PacketStream requires specific query params or body. 
    // Based on standard reseller APIs, specific implementation:
    const params = new URLSearchParams({
        username: finalUsername
    });

    const res = await fetch(`${PACKETSTREAM_API_URL}/sub_users/create?${params}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`PacketStream Purchase Failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data;
}

export async function getResellerBalance() {
    const apiKey = await getPacketStreamKey();
    const res = await fetch(`${PACKETSTREAM_API_URL}/account/info`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    if (!res.ok) return null;
    return await res.json();
}
