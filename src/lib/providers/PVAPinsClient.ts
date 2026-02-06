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

    private async fetchRaw(endpoint: string, params: Record<string, string> = {}): Promise<string> {
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
        return res.text();
    }

    async purchaseNumber(serviceId: string, countryId: string): Promise<SMSOrder> {
        // Endpoint: get_number.php
        // Params: country (NAME like "Indonesia"), app (service name like "telegram")
        // Response: Plain phone number on success, error text on failure

        const rawResponse = await this.fetchRaw('get_number.php', {
            country: countryId,
            app: serviceId
        });

        console.log(`[PVAPins] Purchase response: ${rawResponse}`);

        // Check for known error messages
        const lowerResponse = rawResponse.toLowerCase();
        if (lowerResponse.includes('not found') ||
            lowerResponse.includes('no free channels') ||
            lowerResponse.includes('error') ||
            lowerResponse.includes('invalid') ||
            lowerResponse.includes('insufficient')) {
            throw new Error(rawResponse);
        }

        // Try to parse as JSON first (in case API changes)
        try {
            const jsonData = JSON.parse(rawResponse);
            if (jsonData.error || jsonData.Error) {
                throw new Error(jsonData.error || jsonData.Error);
            }
            if (jsonData.number) {
                return {
                    orderId: jsonData.id?.toString() || `pva-${Date.now()}`,
                    phoneNumber: jsonData.number,
                    cost: parseFloat(jsonData.price) || 0,
                    provider: 'pvapins',
                    country: countryId,
                    service: serviceId
                };
            }
        } catch (e) {
            // Not JSON, continue with plain text handling
        }

        // Plain text response - should be a phone number
        const phoneNumber = rawResponse.trim();

        // Validate it looks like a phone number (digits only, 10-15 chars)
        if (!/^\d{10,15}$/.test(phoneNumber)) {
            throw new Error(`Invalid response from PVAPins: ${rawResponse.substring(0, 100)}`);
        }

        return {
            orderId: `pva-${Date.now()}`, // Generate our own order ID since API doesn't provide one
            phoneNumber: phoneNumber,
            cost: 0, // Will use price from frontend
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
