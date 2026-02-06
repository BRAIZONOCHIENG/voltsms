import { SMSProvider, SMSOrder } from './types';

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

    async purchaseNumber(serviceId: string, countryId: string): Promise<SMSOrder> {
        // SMSPool uses numeric IDs for country and service
        // Endpoint: /purchase/sms
        // Params: key, country, service

        const params = new URLSearchParams({
            key: this.apiKey,
            country: countryId,
            service: serviceId
        });

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

        return {
            orderId: data.order_id?.toString() || `smspool-${Date.now()}`,
            phoneNumber: data.phonenumber || data.number,
            cost: parseFloat(data.cost) || 0,
            provider: 'smspool',
            country: countryId,
            service: serviceId
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
            return data.success === 1 || data.message?.toLowerCase().includes('success');
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
