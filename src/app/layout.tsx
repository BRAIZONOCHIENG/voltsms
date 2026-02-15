import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.store';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VoltSMS | Instant Non-VoIP SMS Verification | Real SIM Numbers",
    template: "%s | VoltSMS",
  },
  description: "Receive SMS online with premium Non-VoIP numbers. Bypass OTP filters on WhatsApp, Telegram, Tinder, and Google with real SIM cards. 100% Privacy & Instant Delivery.",
  keywords: [
    "Non-VoIP SMS verification",
    "Real SIM card numbers",
    "Receive SMS online free",
    "Bypass OTP online",
    "Temporary phone numbers",
    "WhatsApp verification bypass",
    "Telegram non-voip numbers",
    "Tinder sms verification",
    "Google account verification",
    "SMSPool alternative",
    "Textverified alternative",
    "Privacy phone numbers",
    "Crypto SMS service"
  ],
  authors: [{ name: "VoltSMS" }],
  creator: "VoltSMS",
  publisher: "VoltSMS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "VoltSMS",
    title: "VoltSMS - Professional Non-VoIP SMS Verification Service",
    description: "Get real SIM numbers for OTP verification. Bypasses all VoIP filters on major platforms like Telegram, Tinder, and WhatsApp.",
    images: [
      {
        url: `${BASE_URL}/voltsms-logo.png`,
        width: 1200,
        height: 630,
        alt: "VoltSMS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltSMS - Real SIM SMS Verification (Non-VoIP)",
    description: "Instant, anonymous, and reliable SMS verification using real SIM cards. No VoIP blocked numbers.",
    images: [`${BASE_URL}/voltsms-logo.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "q8vXT-uGNovrHonR-uvvmjV4c89xiw5kR7egROV60wk",
  },
};

import Footer from "../components/Footer";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { OrganizationSchema, WebSiteSchema } from "../components/JsonLd";
import { Web3ModalProvider } from "../context/Web3ModalProvider";
import LiveActivityTicker from "../components/LiveActivityTicker";

import { LanguageProvider } from "../context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <LanguageProvider>
          <AnimatedBackground />
          <Web3ModalProvider>
            <div className="relative z-10 flex flex-col flex-1">
              {children}
            </div>
            <OrganizationSchema />
            <WebSiteSchema />
            <div className="relative z-10">
              <Footer />
            </div>
            <LiveActivityTicker />
          </Web3ModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
