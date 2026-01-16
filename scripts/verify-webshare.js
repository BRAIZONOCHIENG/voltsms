const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const apiKeyMatch = envContent.match(/WEBSHARE_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].replace(/["']/g, '').trim() : process.env.WEBSHARE_API_KEY;

if (!apiKey) {
    console.error("❌ WEBSHARE_API_KEY not found in .env.local or process.env");
    process.exit(1);
}

console.log(`Checking Webshare API with Key: ${apiKey.substring(0, 5)}...`);

const options = {
    hostname: 'proxy.webshare.io',
    path: '/api/v2/profile/',
    method: 'GET',
    headers: {
        'Authorization': `Token ${apiKey}`
    }
};

const req = https.request(options, (res) => {
    console.log(`Profile Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("✅ Webshare Profile Connection Successful!");

            // Now check Proxy List
            const listOptions = {
                hostname: 'proxy.webshare.io',
                path: '/api/v2/proxy/list/?mode=direct&page=1&page_size=20',
                method: 'GET',
                headers: { 'Authorization': `Token ${apiKey}` }
            };

            const listReq = https.request(listOptions, (listRes) => {
                let listData = '';
                listRes.on('data', (chunk) => { listData += chunk; });
                listRes.on('end', () => {
                    if (listRes.statusCode === 200) {
                        const proxies = JSON.parse(listData);
                        console.log("\n✅ Proxy List Fetched!");
                        console.log(`Count: ${proxies.count}`);
                        if (proxies.results && proxies.results.length > 0) {
                            console.log("All Proxies found:");
                            proxies.results.forEach(p => {
                                console.log(`- IP: ${p.proxy_address || p.ip} | ASN: ${p.asn_name}`);
                            });
                        } else {
                            console.log("⚠️ No proxies found in account.");
                        }
                    } else {
                        console.error("❌ Proxy List Failed:", listRes.statusCode, listData);
                    }
                });
            });
            listReq.on('error', (e) => console.error(e));
            listReq.end();

        } else {
            console.error("❌ Profile Connection Failed");
            console.error("Response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
