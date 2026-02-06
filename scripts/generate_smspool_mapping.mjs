// Script to fetch all SMSPool services and generate a static mapping
// Mapping: service_name (normalized) -> SMSPool ID

const SMSPOOL_API_KEY = 'J0MZ7SweU9P6uBPzwliH6VwnRGAQg8db';

async function fetchAndGenerateMapping() {
    console.log('Fetching SMSPool services...');

    // Fetch all services
    const res = await fetch(`https://api.smspool.net/service/retrieve_all?key=${SMSPOOL_API_KEY}`);
    const services = await res.json();

    console.log(`Fetched ${services.length} services`);

    // Create mapping: normalized_name -> ID
    const mapping = {};

    for (const svc of services) {
        const id = svc.ID?.toString() || svc.id?.toString();
        const name = svc.name || '';

        if (!id || !name) continue;

        // Generate multiple keys for each service to improve matching
        // 1. Original name lowercase, no special chars
        const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        mapping[normalized] = id;

        // 2. With common variations
        const withSlash = name.toLowerCase().replace(/[^a-z0-9\/]/g, '');
        if (withSlash !== normalized) mapping[withSlash] = id;

        // 3. First word only for compound names
        const firstWord = normalized.match(/^[a-z]+/)?.[0];
        if (firstWord && firstWord.length > 3 && !mapping[firstWord]) {
            mapping[firstWord] = id;
        }
    }

    // Output as TypeScript
    console.log('\n// SMSPool Service Name to ID Mapping');
    console.log('// Generated from SMSPool API');
    console.log('export const SMSPOOL_SERVICE_MAPPING: Record<string, string> = {');

    const sortedKeys = Object.keys(mapping).sort();
    for (const key of sortedKeys) {
        console.log(`    '${key}': '${mapping[key]}',`);
    }

    console.log('};');

    console.log(`\n// Total: ${sortedKeys.length} mappings for ${services.length} services`);
}

fetchAndGenerateMapping().catch(console.error);
