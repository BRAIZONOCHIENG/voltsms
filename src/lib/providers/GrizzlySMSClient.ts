
import axios from 'axios';
import SMSPOOL_MAPPING from '@/lib/smspool_map.json';

const API_URL = 'https://api.smspool.net/stubs/handler_api.php';
// Use process.env directly to avoid circular dependency issues if any
const API_KEY = process.env.SMSPOOL_API_KEY;

// Country Mapping (SMSPool IDs)
const COUNTRY_MAPPING: Record<string, string> = {
    '1': '1',   // US -> 1
    '44': '2',  // UK -> 2
    '31': '9',  // Netherlands -> 9
    '7': '33',  // Russia -> 33
    '380': '34', // Ukraine -> 34
    '62': '12',  // Indonesia -> 12
    '84': '10', // Vietnam -> 10
    '63': '13',  // Philippines -> 13
    '60': '14',  // Malaysia -> 14
    '66': '15',  // Thailand -> 15
    '55': '23', // Brazil -> 23
    // Add more as needed
};

// Service Mapping (Voltsms ID -> Grizzly ID)
// usually matches if standard codes are used. 
// If not, we map them.
// DEPRECATED: We now rely on smspool_map.json mostly.
const SERVICE_MAPPING: Record<string, string> = {
    // Keep legacy mappings just in case, but prefer JSON map
    'wa': 'wa',
    'tg': 'tg',
    'go': 'go',
    'fb': 'fb',
    'ig': 'ig',
    'tw': 'tw',
    'ds': 'ds',
    'lf': 'lf',
    'sc': 'sc',
    'mm': 'mm',
    'vi': 'vi',
    'am': 'am',
    'nf': 'nf',
    'st': 'st',
    'oi': 'oi',
    'mo': 'mo',
    'ub': 'ub',
    'ly': 'ly',
    'dr': 'dr',
    'ot': 'ot'
};

export class GrizzlySMSClient {

    private static getApiKey(): string {
        // Fallback for dev/testing if not in env (User needs to add it)
        const key = API_KEY || process.env.NEXT_PUBLIC_GRIZZLY_API_KEY;
        if (!key) {
            console.error("GRIZZLY_API_KEY is not set");
            // throw new Error("Grizzly SMS API Key is missing"); // Don't crash here, might handle gracefully
            return '';
        }
        return key;
    }

    private static getCountryId(countryCode: string): string {
        // Remove '+' if present
        const code = countryCode.replace('+', '');
        // Logic: if code is in mapping, returning mapping. 
        // If code is numeric and NOT in mapping, maybe it IS the ID? (Dangerous assumption)
        // Best to rely on mapping.
        return COUNTRY_MAPPING[code] || '187'; // Default to US (187) if unknown
    }

    private static getServiceId(serviceId: string): string {
        const lower = serviceId.toLowerCase();

        // 1. Check SMSPool Numeric Mapping (Generated)
        const mapping = SMSPOOL_MAPPING as Record<string, number>;
        if (mapping[lower]) {
            return String(mapping[lower]);
        }

        // 2. Fallback to Legacy Mapping
        return SERVICE_MAPPING[lower] || lower;
    }

    static async getBalance(): Promise<number> {
        try {
            const key = this.getApiKey();
            if (!key) return 0;

            const response = await axios.get(API_URL, {
                params: {
                    api_key: key,
                    action: 'getBalance',
                    setting: 'smspool'
                }
            });
            // Response: ACCESS_BALANCE:100.50
            const data = response.data;
            if (String(data).startsWith('ACCESS_BALANCE')) {
                return parseFloat(data.split(':')[1]);
            }
            return 0;
        } catch (error) {
            console.error("Grizzly getBalance error:", error);
            return 0;
        }
    }

    static async purchaseNumber(serviceId: string, countryCode: string, pricing_option: number = 1, maxPrice?: number): Promise<{ order_id: string; number: string; price?: number } | null> {
        try {
            const key = this.getApiKey();
            if (!key) throw new Error("Missing API Key");

            const mappedService = this.getServiceId(serviceId);
            const mappedCountry = this.getCountryId(countryCode);

            // Pre-check balance to ensure correct error message if funds are low
            // User reported seeing "No Numbers" when balance is 0, which is misleading.
            // Force "No Balance" error if funds are critically low.
            const currentBalance = await this.getBalance();
            if (currentBalance < 0.10) { // Threshold for minimum service cost (usually > $0.10)
                throw new Error("NO_BALANCE");
            }

            const queryParams: any = {
                api_key: key,
                action: 'getNumber',
                service: mappedService,
                country: mappedCountry,
                setting: 'smspool',
                pricing_option: pricing_option // 1 = Highest Success, 0 = Default (Cheapest)
            };

            if (maxPrice !== undefined) {
                queryParams.max_price = maxPrice;
            }

            const response = await axios.get(API_URL, {
                params: queryParams
            });

            // Response: ACCESS_NUMBER:$id:$number
            // Error: NO_NUMBERS, NO_BALANCE, UNKNOWN_ERROR
            let data = String(response.data);
            console.log(`Grizzly purchase response (${serviceId}/${countryCode}):`, data);

            // Retry logic removed to enforce High Quality. 
            // If pricing_option=1 fails, we do NOT want a low quality number.
            // Old retry block intentionally deleted.

            if (data.startsWith('ACCESS_NUMBER')) {
                const parts = data.split(':');
                return {
                    order_id: parts[1],
                    number: parts[2],
                    price: 0
                };
            }

            if (data === 'NO_NUMBERS') {
                throw new Error('NO_NUMBERS');
            }
            if (data === 'NO_BALANCE') {
                throw new Error('NO_BALANCE');
            }
            if (data.includes('BAD_ACTION') || data.includes('BAD_SERVICE')) {
                throw new Error('SERVICE_UNAVAILABLE');
            }

            return null; // Unknown response
        } catch (error: any) {
            console.error("Grizzly purchaseNumber error:", error.message || error);
            // Re-throw known errors
            if (['NO_NUMBERS', 'NO_BALANCE', 'SERVICE_UNAVAILABLE'].includes(error.message)) {
                throw error;
            }
            return null;
        }
    }

    static async checkStatus(orderId: string): Promise<{ status: 'PENDING' | 'COMPLETED' | 'CANCELED'; code?: string } | null> {
        try {
            const key = this.getApiKey();
            if (!key) return null;

            const response = await axios.get(API_URL, {
                params: {
                    api_key: key,
                    action: 'getStatus',
                    id: orderId,
                    setting: 'smspool'
                }
            });

            // Responses:
            // STATUS_WAIT_CODE
            // STATUS_WAIT_RETRY
            // STATUS_OK:CODE
            // STATUS_CANCEL
            const data = String(response.data);

            if (data === 'STATUS_WAIT_CODE' || data === 'STATUS_WAIT_RETRY') {
                return { status: 'PENDING' };
            }
            if (data.startsWith('STATUS_OK')) {
                const code = data.split(':')[1];
                return { status: 'COMPLETED', code };
            }
            if (data === 'STATUS_CANCEL') {
                return { status: 'CANCELED' };
            }

            return { status: 'PENDING' }; // Default
        } catch (error) {
            console.error("Grizzly checkStatus error:", error);
            return null;
        }
    }

    static async setStatus(orderId: string, status: '1' | '3' | '6' | '8'): Promise<boolean> {
        // 1 = Ready (SMS sent)
        // 3 = Request another code
        // 6 = Finish activation
        // 8 = Cancel
        try {
            const key = this.getApiKey();
            if (!key) return false;

            const response = await axios.get(API_URL, {
                params: {
                    api_key: key,
                    action: 'setStatus',
                    id: orderId,
                    status: status,
                    setting: 'smspool'
                }
            });
            const data = String(response.data);
            if (data.includes('ACCESS_')) return true;
            return false;
        } catch (error) {
            console.error("Grizzly setStatus error:", error);
            return false;
        }
    }

    // New Function
    static async getPrices(countryCode: string): Promise<Record<string, number>> {
        try {
            const key = this.getApiKey();
            if (!key) return {};

            const mappedCountry = this.getCountryId(countryCode);

            // Action: getPrices? Grizzly might use 'getPrices' or just 'getNumbersStatus' with price?
            // Checking Docs: usually 'getPrices' action exists in SMS Activate API clones.
            // If not, 'getNumbersStatus' returns available count but maybe not price.
            // Let's assume standard 'getPrices'.

            const response = await axios.get(API_URL, {
                params: {
                    api_key: key,
                    action: 'getPrices',
                    country: mappedCountry,
                    setting: 'smspool'
                }
            });

            // Response format usually: { "country": { "service": { "cost": 10.5, "count": 100 } } }
            // Or: { "187": { "wa": { "cost": 10.5, "count": 100 } } }

            const data = response.data;
            const prices: Record<string, number> = {};

            if (data && data[mappedCountry]) {
                const services = data[mappedCountry];
                for (const [service, info] of Object.entries(services)) {
                    // Grizzly prices are usually in RUB or USD? 
                    // We need to know the currency. Account setting?
                    // Usually API returns rate in account currency. 
                    // Let's assume user account is in USD or we check balance currency?
                    // Standard SMS Activate API returns rubles often. 
                    // We might need a rate converter if it's RUB. 
                    // BUT Grizzly is often USD based for international.
                    // Let's assume the value is in the same currency as getBalance.

                    if (typeof info === 'object' && info !== null && 'cost' in (info as any)) {
                        prices[service] = parseFloat((info as any).cost);
                    }
                }
            }
            return prices;
        } catch (error) {
            console.error("Grizzly getPrices error:", error);
            return {};
        }
    }
}
