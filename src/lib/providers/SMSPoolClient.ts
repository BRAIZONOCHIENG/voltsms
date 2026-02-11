import { SMSProvider, SMSOrder } from './types';

/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - CRITICAL INFRASTRUCTURE
 * -----------------------------------------------------------------------------
 * Low-level SMSPool API interactions.
 * Any changes here affect ALL SMS operations (buy, check, cancel).
 * 
 * See .agent/workflows/protected-files.md for details.
 * -----------------------------------------------------------------------------
 */
const SMSPOOL_BASE_URL = 'https://api.smspool.net';

export class SMSPoolClient implements SMSProvider {
    name = 'smspool';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getBalance(): Promise<number> {
        try {
            const res = await fetch(`${SMSPOOL_BASE_URL}/request/balance?key=${this.apiKey}`);
            const data = await res.json();
            console.log('[SMSPool] Balance:', data);
            if (data.balance) {
                return parseFloat(data.balance);
            }
            return 0;
        } catch (e) {
            console.error('Failed to get SMSPool balance', e);
            return 0;
        }
    }

    async purchaseNumber(serviceId: string, countryId: string, pricingOption?: string, maxPrice?: number): Promise<SMSOrder> {
        // SMSPool uses numeric IDs for country and service
        // Endpoint: /purchase/sms
        // Params: key, country, service, pricing_option, max_price

        const queryParams: Record<string, string> = {
            key: this.apiKey,
            country: countryId,
            service: serviceId
        };

        if (pricingOption) {
            queryParams['pricing_option'] = pricingOption;
        }

        if (maxPrice !== undefined) {
            queryParams['max_price'] = maxPrice.toString();
        }

        const params = new URLSearchParams(queryParams);

        console.log(`[SMSPool] Purchasing: country=${countryId}, service=${serviceId}`);

        const res = await fetch(`${SMSPOOL_BASE_URL}/purchase/sms?${params.toString()}`, {
            method: 'POST'
        });

        const text = await res.text();
        console.log(`[SMSPool] Purchase response: ${text}`);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`SMSPool returned invalid response: ${text.substring(0, 200)}`);
        }

        // Check for errors
        if (data.success === 0 || data.error) {
            throw new Error(data.message || data.error || 'Purchase failed');
        }

        if (!data.phonenumber && !data.number) {
            throw new Error('No phone number returned from SMSPool');
        }

        // Calculate expiration time from expires_in (seconds)
        const expiresIn = data.expires_in || 1200; // Default 20 mins
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        return {
            orderId: data.order_id?.toString() || data.orderid?.toString() || `smspool-${Date.now()}`,
            phoneNumber: data.phonenumber || data.number,
            cost: parseFloat(data.cost) || 0,
            provider: 'smspool',
            country: countryId,
            service: serviceId,
            expiresAt: expiresAt
        };
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                orderid: orderId
            });

            const res = await fetch(`${SMSPOOL_BASE_URL}/sms/cancel?${params.toString()}`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success === 1 || data.message?.toLowerCase().includes('success')) {
                return true;
            }

            // IDEMPOTENCY FIX:
            // If SMSPool says "Order not found", "expired", or "already cancelled", 
            // it means the order is dead on their end. We should return TRUE 
            // so our system processes the local refund/cancellation to stay in sync.
            const msg = (data.message || data.error || JSON.stringify(data)).toLowerCase();
            if (msg.includes('found') || msg.includes('expired') || msg.includes('cancel')) {
                console.log(`[SMSPool] Order ${orderId} already dead (${msg}). Treating as cancelled.`);
                return true;
            }

            console.error(`[SMSPool] Cancel failed for order ${orderId}:`, data);
            return false;
        } catch (e) {
            console.error('Failed to cancel SMSPool order', e);
            return false;
        }
    }

    async getSMS(orderId: string): Promise<string | null> {
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                orderid: orderId
            });

            const res = await fetch(`${SMSPOOL_BASE_URL}/sms/check?${params.toString()}`);
            const data = await res.json();

            // SMSPool returns { status: 3, sms: "Your code is 1234" } when SMS received
            // status 1 = pending, 2 = expired, 3 = completed
            if (data.status === 3 && data.sms) {
                // Extract code from SMS
                const codeMatch = data.sms.match(/(\d{4,8})/);
                return codeMatch ? codeMatch[0] : data.sms;
            }

            return null;
        } catch (e) {
            console.error('Failed to get SMS from SMSPool', e);
            return null;
        }
    }

    // Get available services for a country
    async getServices(countryId: string): Promise<any[]> {
        try {
            const res = await fetch(`${SMSPOOL_BASE_URL}/service/retrieve_all?key=${this.apiKey}&country=${countryId}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Failed to get SMSPool services', e);
            return [];
        }
    }

    // Find a service ID by name - searches SMSPool services
    async findServiceIdByName(serviceName: string, countryId: string = '1'): Promise<string | null> {
        try {
            const services = await this.getServices(countryId);
            if (!services.length) return null;

            // Normalize the service name for matching
            const normalizedInput = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Try exact match first
            for (const svc of services) {
                const svcName = (svc.name || svc.service || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (svcName === normalizedInput) {
                    return svc.ID?.toString() || svc.id?.toString() || null;
                }
            }

            // Try partial match (input contains service name or vice versa)
            for (const svc of services) {
                const svcName = (svc.name || svc.service || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedInput.includes(svcName) || svcName.includes(normalizedInput)) {
                    return svc.ID?.toString() || svc.id?.toString() || null;
                }
            }

            return null;
        } catch (e) {
            console.error('Failed to find service by name', e);
            return null;
        }
    }

    // Get available countries
    async getCountries(): Promise<any[]> {
        try {
            const res = await fetch(`${SMSPOOL_BASE_URL}/country/retrieve_all?key=${this.apiKey}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Failed to get SMSPool countries', e);
            return [];
        }
    }
}
