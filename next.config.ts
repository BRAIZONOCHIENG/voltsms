import type { NextConfig } from "next";
import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevent MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.simpleicons.org https://*.paystack.co https://*.paystack.com https://*.paypal.com https://*.paypalobjects.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://cdn.simpleicons.org https: https://api.qrserver.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://explorer-api.walletconnect.com; font-src 'self' data:; connect-src 'self' https://cdn.simpleicons.org https: wss: https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://explorer-api.walletconnect.com https://rpc.walletconnect.com https://api.web3modal.com; frame-src 'self' https://*.paystack.co https://*.paystack.com https://*.paypal.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://verify.walletconnect.com;"
          }
        ]
      }
    ]
  }
};

export default nextConfig;
