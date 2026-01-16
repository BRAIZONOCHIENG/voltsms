import ALL_COUNTRIES_JSON from '../../data/countries.json';

export interface Country {
    code: string;
    id: string; // New: Internal ID for API
    name: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    // Ensure Tier 1 Countries exist
    { code: 'US', id: '1', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', id: '36', name: 'Canada', flag: '🇨🇦' }, // CA often ID 36 in SMSPool
    { code: 'AU', id: '60', name: 'Australia', flag: '🇦🇺' }, // AU often ID 60
    { code: 'GB', id: '2', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', id: '24', name: 'Germany', flag: '🇩🇪' },
    { code: 'NL', id: '3', name: 'Netherlands', flag: '🇳🇱' },
    ...ALL_COUNTRIES_JSON.map(c => ({
        code: c.code,
        id: c.id,
        name: c.name,
        flag: c.flag
    })).filter(c =>
        !['US', 'CA', 'AU', 'GB', 'DE', 'NL'].includes(c.code) && // Dedup manually added ones
        !c.name.includes('(Virtual)') // Remove VoIP/Virtual numbers
    )
];
