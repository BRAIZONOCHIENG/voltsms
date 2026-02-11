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
    default: "VoltSMS - Non-VoIP SMS Verification | Real SIM Numbers",
    template: "%s | VoltSMS",
  },
  description: "Bypass SMS verification on Tinder, Telegram, WhatsApp & more with premium Non-VoIP numbers. Real SIM cards, not virtual. Instant delivery & secure crypto payments.",
  keywords: ["Non-VoIP number", "Real SIM verification", "Bypass OTP", "SMS verification service", "Tinder verification", "Telegram verification", "WhatsApp verification", "temporary phone number", "receive SMS online", "bypassing verification"],
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
    title: "VoltSMS - Non-VoIP SMS Verification | Real SIM Numbers",
    description: "Bypass SMS verification on Tinder, Telegram, WhatsApp & more with premium Non-VoIP numbers. Real SIM cards, not virtual.",
    images: [
      {
        url: `${BASE_URL}/voltsms-logo.png`,
        width: 512,
        height: 512,
        alt: "VoltSMS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltSMS - Non-VoIP SMS Verification",
    description: "Bypass SMS verification with premium Non-VoIP numbers. Real SIM cards, not virtual.",
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
        </Web3ModalProvider>
      </body>
    </html>
  );
}
