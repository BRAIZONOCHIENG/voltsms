const https = require('node:https');

const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;

// Pricing Logic (Mirrored from generate_static_data.js)
const TOP_SERVICES = [
    "1688", "Alibaba", "Amazon", "Apple", "Baidu", "Bilibili", "Discord", "Douyin",
    "Facebook", "Google", "Instagram", "KakaoTalk", "Line", "LinkedIn", "Microsoft",
    "Netflix", "OpenAI", "PayPal", "Pinterest", "QQ", "Snapchat", "Steam", "Telegram",
    "TikTok", "Tinder", "Twitter", "Uber", "WeChat", "Weibo", "WhatsApp", "Yahoo", "YouTube"
];
const ASIAN_KEYWORDS = ["douyin", "weibo", "qq", "baidu", "1688", "alibaba", "taobao", "jd", "redbook", "bilibili"];

function calculatePrice(cost, name) {
    if (name.toLowerCase().includes('google') || name.toLowerCase().includes('gmail') || name.toLowerCase().includes('youtube')) return 2.00;

    let price = cost;
    if (price <= 0.30) price = 0.55;
    else price = price + 0.30;

    if (TOP_SERVICES.some(s => name.includes(s))) price += 0.15;
    const isAsian = ASIAN_KEYWORDS.some(k => name.toLowerCase().includes(k));
    if (isAsian) price += 0.30;

    if (price > 2.00) price = 2.00;
    return parseFloat(price.toFixed(2));
}

function fetchNative(url) {
    return new Promise((resolve) => {
        https.get(url, { timeout: 5000 }, (res) => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
        }).on('error', () => resolve({}));
    });
}

async function main() {
    console.log("Analyzing Profit Margins...\n");
    console.log("Service             | Cost (Est) | Selling Price | Profit ($) | Margin (%)");
    console.log("--------------------|------------|---------------|------------|-----------");

    const servicesToCheck = [
        { id: 395, name: "Google/Gmail" },    // High demand, manual cap
        { id: 22, name: "WhatsApp" },      // Top Service
        { id: 39, name: "Amazon" },        // Shopping
        { id: 16, name: "Telegram" },      // Top Service
        { id: 620, name: "OpenAI" },       // AI
        { id: 1, name: "1688" },         // Asian
        { id: 709, name: "Temu" },         // Shopping, Low cost?
        { id: 367, name: "Discord" },       // Top
        { id: 999, name: "Service Not Listed" } // Manual
    ];

    for (const s of servicesToCheck) {
        let cost = 0.20; // Default
        if (s.id !== 999) {
            const priceData = await fetchNative(`https://api.smspool.net/request/price?key=${SMSPOOL_API_KEY}&country=1&service=${s.id}`);
            if (priceData.price) cost = parseFloat(priceData.price);
        }

        const price = s.name === "Service Not Listed" ? 1.00 : calculatePrice(cost, s.name);
        const profit = price - cost;
        const margin = Math.round((profit / cost) * 100);

        console.log(`${s.name.padEnd(20)} | $${cost.toFixed(2)}       | $${price.toFixed(2)}          | $${profit.toFixed(2)}       | ${margin}%`);

        // Rate limit
        await new Promise(r => setTimeout(r, 200));
    }
}

main();
