import { SMSProvider, SMSOrder } from './types';

const PVAPINS_BASE_URL = 'https://api.pvapins.com/user/api';

// We will populate this dynamically later, but keeping structure for now
export class PVAPinsClient implements SMSProvider {
    name = 'pvapins';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetch(endpoint: string, params: Record<string, string> = {}) {
        // Enforce .php extension if distinct endpoints are used, or strictly follow their format
        // User provided: http://api.pvapins.com/user/api/get_history.php?customer=apikey
        // So base is .../user/api
        // Endpoint should be 'get_balance.php' etc.

        const url = new URL(`${PVAPINS_BASE_URL}/${endpoint}`);
        url.searchParams.append('customer', this.apiKey);

        for (const [k, v] of Object.entries(params)) {
            url.searchParams.append(k, v);
        }

        console.log(`[PVAPins] Request: ${url.toString().replace(this.apiKey, '***')}`);

        const res = await fetch(url.toString());
        if (!res.ok) {
            throw new Error(`PVAPins API Error: ${res.status}`);
        }
        return res.json();
    }

    async getBalance(): Promise<number> {
        // User showed: get_balance.php?customer=...
        // Response: { balance: "0.00" }
        try {
            const data = await this.fetch('get_balance.php');
            console.log('[PVAPins] Balance Raw:', data);
            if (data.balance) {
                return parseFloat(data.balance);
            }
            return 0;
        } catch (e) {
            console.error('Failed to get PVAPins balance', e);
            return 0;
        }
    }

    async purchaseNumber(serviceId: string, countryId: string): Promise<SMSOrder> {
        // Endpoint: get_number.php
        // Params: country, app (service)
        // Note: PVAPins uses 'app' param usually, not 'service'. Let's verify documentation or assume 'app'.
        // Based on typical scripts for this API family: get_number.php?country=X&app=Y

        const data = await this.fetch('get_number.php', {
            country: countryId,
            app: serviceId
        });

        // Response check
        // Success: { number: '...', id: '...', price: '...', ... }
        // Error: { Error: '...' } or { error: '...' }

        if (data.Error || data.error) {
            throw new Error(data.Error || data.error || 'Failed to purchase number');
        }

        if (!data.number) {
            throw new Error('No number returned from PVAPins');
        }

        return {
            orderId: data.id.toString(),
            phoneNumber: data.number,
            cost: parseFloat(data.price),
            provider: 'pvapins',
            country: countryId,
            service: serviceId
        };
    }

    async cancelOrder(orderId: string): Promise<boolean> {
        // Endpoint: set_status.php
        // Params: id, status=8 (Cancel)
        // Status codes: 1=Ready, 6=End, 8=Cancel
        try {
            const data = await this.fetch('set_status.php', {
                id: orderId,
                status: '8'
            });
            // Check for "success" string or code
            return JSON.stringify(data).toLowerCase().includes('success') || data.code == 200;
        } catch (e) {
            console.error('Failed to cancel PVAPins order', e);
            return false;
        }
    }

    async getSMS(orderId: string): Promise<string | null> {
        // Endpoint: get_sms.php
        // Params: id
        const data = await this.fetch('get_sms.php', {
            id: orderId
        });

        // Response could be:
        // { sms: 'Code: 1234' }
        // or { error: 'WAIT_LINK' }

        if (data.sms) {
            // Extract code logic
            const codeMatch = data.sms.match(/(\d{4,8})/);
            return codeMatch ? codeMatch[0] : data.sms;
        }

        return null;
    }

    // New methods to enable dynamic fetching
    async getCountries(): Promise<any[]> {
        // Endpoint: load_countries.php?customer=...
        // Or sometimes just public without customer. But let's use authenticated if possible or public.
        // User images showed load_countries.php
        const data = await this.fetch('load_countries.php');
        return Array.isArray(data) ? data : [];
    }

    async getServices(countryId: string = '1'): Promise<any[]> {
        // Endpoint: load_apps.php?country=...
        const data = await this.fetch('load_apps.php', { country: countryId });
        return Array.isArray(data) ? data : [];
    }
}
