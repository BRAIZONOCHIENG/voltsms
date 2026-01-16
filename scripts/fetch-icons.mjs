import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Mock Services (Copied structure since importing .ts in .mjs is hard without compilation)
// Reading the file directly to extract names
const servicesPath = path.join(process.cwd(), 'src/app/dashboard/services.ts');
const iconsDir = path.join(process.cwd(), 'public/icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

const map = {
    'X (Twitter)': 'x',
    'Telegram': 'telegram',
    'WhatsApp': 'whatsapp',
    'Facebook': 'facebook',
    'Instagram': 'instagram',
    'TikTok': 'tiktok',
    'Google': 'google',
    'Microsoft': 'microsoft',
    'OpenAI': 'openai',
    'Uber': 'uber',
    'Airbnb': 'airbnb',
    'Amazon': 'amazon',
    'Netflix': 'netflix',
    'Discord': 'discord',
    'LinkedIn': 'linkedin',
    'Snapchat': 'snapchat',
    'Tinder': 'tinder',
};

function getSlug(name) {
    if (map[name]) return map[name];
    const lowerName = name.toLowerCase();
    if (lowerName.includes('google')) return 'google';
    if (lowerName.includes('microsoft')) return 'microsoft';
    if (lowerName.includes('apple')) return 'apple';
    if (lowerName.includes('amazon')) return 'amazon';
    return lowerName.replace(/[^a-z0-9]/g, '');
}

function fetchIcon(slug) {
    return new Promise((resolve, reject) => {
        const url = `https://cdn.simpleicons.org/${slug}`;
        const filePath = path.join(iconsDir, `${slug}.svg`);

        // Check if exists
        if (fs.existsSync(filePath)) {
            // console.log(`Exists: ${slug}`);
            resolve(true); // Skip
            return;
        }

        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filePath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${slug}`);
                    resolve(true);
                });
            } else {
                console.error(`Failed: ${slug} (Status: ${res.statusCode})`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.error(`Error: ${slug}`, err);
            resolve(false);
        });
    });
}

async function run() {
    const content = fs.readFileSync(servicesPath, 'utf8');
    const regex = /name:\s*'([^']+)'/g;
    let match;
    const items = [];

    while ((match = regex.exec(content)) !== null) {
        items.push(match[1]);
    }

    console.log(`Found ${items.length} services.`);

    // Parallel limit
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(name => fetchIcon(getSlug(name))));
    }

    console.log("Done!");
}

run();
